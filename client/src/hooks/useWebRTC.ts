import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

export interface HuddleParticipant {
    userId: string;
    socketId: string;
    userName: string;
    isMuted?: boolean;
    isSpeaking?: boolean;
    hasHandRaised?: boolean;
    isVideoOn?: boolean;
    stream?: MediaStream;
}

interface UseWebRTCOptions {
    projectId?: string;
    userId?: string;
    userName?: string;
    userRole?: "owner" | "editor" | "viewer" | string;
}

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:global.stun.twilio.com:3478" },
    ],
};

export function useWebRTC({ projectId, userId, userName, userRole }: UseWebRTCOptions) {
    const { socket } = useSocket();

    const [isInHuddle, setIsInHuddle] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [huddleParticipants, setHuddleParticipants] = useState<HuddleParticipant[]>([]);
    const [raisedHandUserIds, setRaisedHandUserIds] = useState<string[]>([]);
    const [remoteStreams, setRemoteStreams] = useState<{ [peerKey: string]: MediaStream }>({});
    const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
    const audioContextRef = useRef<AudioContext | null>(null);
    const animFrameRef = useRef<number | null>(null);

    // Voice Activity Detection (VAD)
    const setupVAD = useCallback((stream: MediaStream) => {
        try {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let prevSpeaking = false;

            const checkVolume = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                const speakingNow = average > 15;

                if (speakingNow !== prevSpeaking) {
                    prevSpeaking = speakingNow;
                    setIsSpeaking(speakingNow);
                    if (socket && projectId && userId) {
                        socket.emit("webrtc:speaking-state", {
                            projectId,
                            userId,
                            isSpeaking: speakingNow,
                        });
                    }
                }

                animFrameRef.current = requestAnimationFrame(checkVolume);
            };

            checkVolume();
        } catch (err) {
            console.error("Failed to initialize Voice Activity Detection (VAD):", err);
        }
    }, [socket, projectId, userId]);

    const getOrCreatePeerConnection = useCallback((peerSocketId: string, peerUserId: string) => {
        const peerKey = peerUserId || peerSocketId;
        if (peerConnectionsRef.current.has(peerKey)) {
            return peerConnectionsRef.current.get(peerKey)!;
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit("webrtc:ice-candidate", {
                    projectId,
                    senderUserId: userId,
                    targetSocketId: peerSocketId,
                    targetUserId: peerUserId,
                    candidate: event.candidate,
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === "failed") {
                console.warn(`ICE connection state for peer ${peerKey} failed. Restarting ICE.`);
                pc.restartIce();
            }
        };

        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (remoteStream) {
                setRemoteStreams((prev) => ({
                    ...prev,
                    [peerKey]: remoteStream,
                }));

                let audioElement = remoteAudioElementsRef.current.get(peerKey);
                if (!audioElement) {
                    audioElement = new Audio();
                    audioElement.autoplay = true;
                    remoteAudioElementsRef.current.set(peerKey, audioElement);
                }
                audioElement.srcObject = remoteStream;
            }
        };

        peerConnectionsRef.current.set(peerKey, pc);
        return pc;
    }, [socket, projectId, userId]);

    const createOfferToPeer = useCallback(async (peerSocketId: string, peerUserId: string) => {
        if (!peerUserId || peerUserId === userId) return;
        const pc = getOrCreatePeerConnection(peerSocketId, peerUserId);
        if (pc.signalingState !== "stable") return;

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            if (socket) {
                socket.emit("webrtc:offer", {
                    projectId,
                    senderUserId: userId,
                    targetSocketId: peerSocketId,
                    targetUserId: peerUserId,
                    offer,
                });
            }
        } catch (error) {
            console.error("Error creating WebRTC offer to peer:", peerUserId, error);
        }
    }, [getOrCreatePeerConnection, socket, projectId, userId]);

    const cleanupHuddle = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();

        remoteAudioElementsRef.current.forEach((audio) => {
            audio.pause();
            audio.srcObject = null;
        });
        remoteAudioElementsRef.current.clear();

        setIsInHuddle(false);
        setIsMuted(false);
        setIsVideoOn(false);
        setIsSpeaking(false);
        setIsHandRaised(false);
        setHuddleParticipants([]);
        setRaisedHandUserIds([]);
        setRemoteStreams({});
        setLocalStreamState(null);
    }, []);

    // Join huddle
    const joinHuddle = useCallback(async () => {
        if (!socket || !projectId || !userId) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            setLocalStreamState(new MediaStream(stream.getTracks()));

            if (userRole === "viewer") {
                stream.getAudioTracks().forEach((t) => (t.enabled = false));
                setIsMuted(true);
            } else {
                setIsMuted(false);
            }

            setupVAD(stream);
            setIsInHuddle(true);

            socket.emit("webrtc:join-huddle", {
                projectId,
                userId,
                userName: userName || "Developer",
            });
        } catch (error) {
            console.error("Failed to access microphone for WebRTC huddle:", error);
        }
    }, [socket, projectId, userId, userName, userRole, setupVAD]);

    // Leave huddle
    const leaveHuddle = useCallback(() => {
        if (socket && projectId && userId) {
            socket.emit("webrtc:leave-huddle", { projectId, userId });
        }
        cleanupHuddle();
    }, [socket, projectId, userId, cleanupHuddle]);

    // Toggle Mute
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            const nextState = !isMuted;
            audioTracks.forEach((track) => {
                track.enabled = !nextState;
            });
            setIsMuted(nextState);
        }
    }, [isMuted]);

    // Toggle Video (Camera)
    const toggleVideo = useCallback(async () => {
        if (!isInHuddle || !localStreamRef.current) return;

        try {
            if (!isVideoOn) {
                const videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, frameRate: 15 },
                });
                const videoTrack = videoStream.getVideoTracks()[0];

                if (videoTrack) {
                    localStreamRef.current.addTrack(videoTrack);
                    setLocalStreamState(new MediaStream(localStreamRef.current.getTracks()));

                    peerConnectionsRef.current.forEach((pc, peerKey) => {
                        const senders = pc.getSenders();
                        const existingVideoSender = senders.find((s) => s.track?.kind === "video");
                        if (existingVideoSender) {
                            existingVideoSender.replaceTrack(videoTrack);
                        } else {
                            pc.addTrack(videoTrack, localStreamRef.current!);
                        }

                        if (pc.signalingState === "stable") {
                            pc.createOffer().then((offer) => {
                                return pc.setLocalDescription(offer).then(() => {
                                    if (socket) {
                                        socket.emit("webrtc:offer", {
                                            projectId,
                                            senderUserId: userId,
                                            targetUserId: peerKey,
                                            offer,
                                        });
                                    }
                                });
                            }).catch((e) => console.warn("Failed negotiation during video toggle:", e));
                        }
                    });
                }
                setIsVideoOn(true);
                if (socket && projectId && userId) {
                    socket.emit("webrtc:video-state", { projectId, userId, isVideoOn: true });
                }
            } else {
                const videoTracks = localStreamRef.current.getVideoTracks();
                videoTracks.forEach((track) => {
                    track.stop();
                    localStreamRef.current?.removeTrack(track);
                });

                peerConnectionsRef.current.forEach((pc) => {
                    const senders = pc.getSenders();
                    const videoSender = senders.find((s) => s.track?.kind === "video");
                    if (videoSender) {
                        try {
                            pc.removeTrack(videoSender);
                        } catch (e) { }
                    }
                });

                setLocalStreamState(new MediaStream(localStreamRef.current.getTracks()));
                setIsVideoOn(false);
                if (socket && projectId && userId) {
                    socket.emit("webrtc:video-state", { projectId, userId, isVideoOn: false });
                }
            }
        } catch (err) {
            console.error("Error toggling camera video track:", err);
        }
    }, [isInHuddle, isVideoOn, socket, projectId, userId]);

    // Force Mute self
    const forceMuteSelf = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = false;
            });
            setIsMuted(true);
        }
    }, []);

    // Raise / Lower Hand
    const toggleRaiseHand = useCallback(() => {
        if (!socket || !projectId || !userId) return;
        const nextState = !isHandRaised;
        setIsHandRaised(nextState);
        if (nextState) {
            socket.emit("webrtc:raise-hand", { projectId, userId, userName });
        } else {
            socket.emit("webrtc:lower-hand", { projectId, userId });
        }
    }, [socket, projectId, userId, userName, isHandRaised]);

    // Host Action: Mute a specific peer
    const hostMutePeer = useCallback((targetUserId: string, targetSocketId?: string) => {
        if (!socket || !projectId) return;
        socket.emit("webrtc:mute-peer", { projectId, targetUserId, targetSocketId });
    }, [socket, projectId]);

    // Host Action: Mute all peers
    const hostMuteAll = useCallback(() => {
        if (!socket || !projectId) return;
        socket.emit("webrtc:mute-all", { projectId });
    }, [socket, projectId]);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket || !isInHuddle) return;

        const handleHuddleParticipants = (participants: HuddleParticipant[]) => {
            setHuddleParticipants(participants);
            participants.forEach((p) => {
                if (p.userId && p.userId !== userId) {
                    createOfferToPeer(p.socketId, p.userId);
                }
            });
        };

        const handleUserJoinedHuddle = (data: { userId: string; socketId: string; userName: string }) => {
            if (data.userId === userId) return;
            toast.info(`${data.userName || "Collaborator"} joined the huddle 🎙️`);
            setHuddleParticipants((prev) => {
                if (prev.some((p) => p.userId === data.userId)) return prev;
                return [...prev, data];
            });
        };

        const handleUserLeftHuddle = (data: { userId: string; socketId: string; userName?: string }) => {
            if (data.userId === userId) return;
            toast.info(`${data.userName || "Collaborator"} left the huddle`);
            setHuddleParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
            setRaisedHandUserIds((prev) => prev.filter((id) => id !== data.userId));
            const peerKey = data.userId || data.socketId;
            const pc = peerConnectionsRef.current.get(peerKey);
            if (pc) {
                pc.close();
                peerConnectionsRef.current.delete(peerKey);
            }
            const audio = remoteAudioElementsRef.current.get(peerKey);
            if (audio) {
                audio.pause();
                audio.srcObject = null;
                remoteAudioElementsRef.current.delete(peerKey);
            }
            setRemoteStreams((prev) => {
                const updated = { ...prev };
                delete updated[peerKey];
                return updated;
            });
        };

        const handleOffer = async (data: { offer: RTCSessionDescriptionInit; senderUserId: string; senderSocketId: string; targetUserId?: string }) => {
            if (data.senderUserId === userId) return;
            if (data.targetUserId && data.targetUserId !== userId) return;

            const pc = getOrCreatePeerConnection(data.senderSocketId, data.senderUserId);

            try {
                // Guard: setRemoteDescription requires stable or have-local-offer state
                if (pc.signalingState !== "stable" && pc.signalingState !== "have-local-offer") {
                    console.warn(`PeerConnection for ${data.senderUserId} in state ${pc.signalingState}, ignoring offer.`);
                    return;
                }

                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

                if ((pc.signalingState as string) === "have-remote-offer") {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    socket.emit("webrtc:answer", {
                        projectId,
                        senderUserId: userId,
                        targetSocketId: data.senderSocketId,
                        targetUserId: data.senderUserId,
                        answer,
                    });
                }
            } catch (err) {
                console.error("Error handling WebRTC offer safely:", err);
            }
        };

        const handleAnswer = async (data: { answer: RTCSessionDescriptionInit; senderUserId: string; senderSocketId: string; targetUserId?: string }) => {
            if (data.senderUserId === userId) return;
            if (data.targetUserId && data.targetUserId !== userId) return;

            const peerKey = data.senderUserId || data.senderSocketId;
            const pc = peerConnectionsRef.current.get(peerKey);
            if (pc) {
                try {
                    if (pc.signalingState === "have-local-offer") {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                    } else {
                        console.warn(`Received answer when signalingState is ${pc.signalingState}, ignoring.`);
                    }
                } catch (err) {
                    console.error("Error setting remote description from answer:", err);
                }
            }
        };

        const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; senderUserId: string; senderSocketId: string; targetUserId?: string }) => {
            if (data.senderUserId === userId) return;
            if (data.targetUserId && data.targetUserId !== userId) return;

            const peerKey = data.senderUserId || data.senderSocketId;
            const pc = peerConnectionsRef.current.get(peerKey);
            if (pc && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            }
        };

        const handleSpeakingState = (data: { userId: string; isSpeaking: boolean }) => {
            if (data.userId === userId) return;
            setHuddleParticipants((prev) =>
                prev.map((p) => (p.userId === data.userId ? { ...p, isSpeaking: data.isSpeaking } : p))
            );
        };

        const handleVideoState = (data: { userId: string; isVideoOn: boolean }) => {
            if (data.userId === userId) return;
            setHuddleParticipants((prev) =>
                prev.map((p) => (p.userId === data.userId ? { ...p, isVideoOn: data.isVideoOn } : p))
            );
        };

        const handleHandRaised = (data: { userId: string }) => {
            setRaisedHandUserIds((prev) => (prev.includes(data.userId) ? prev : [...prev, data.userId]));
            setHuddleParticipants((prev) =>
                prev.map((p) => (p.userId === data.userId ? { ...p, hasHandRaised: true } : p))
            );
        };

        const handleHandLowered = (data: { userId: string }) => {
            setRaisedHandUserIds((prev) => prev.filter((id) => id !== data.userId));
            setHuddleParticipants((prev) =>
                prev.map((p) => (p.userId === data.userId ? { ...p, hasHandRaised: false } : p))
            );
        };

        const handleForceMuted = (data: { targetUserId: string }) => {
            if (data.targetUserId === userId) {
                forceMuteSelf();
            }
        };

        const handleForceMutedAll = () => {
            if (userRole !== "owner") {
                forceMuteSelf();
            }
        };

        socket.on("webrtc:huddle-participants", handleHuddleParticipants);
        socket.on("webrtc:user-joined-huddle", handleUserJoinedHuddle);
        socket.on("webrtc:user-left-huddle", handleUserLeftHuddle);
        socket.on("webrtc:offer", handleOffer);
        socket.on("webrtc:answer", handleAnswer);
        socket.on("webrtc:ice-candidate", handleIceCandidate);
        socket.on("webrtc:speaking-state", handleSpeakingState);
        socket.on("webrtc:video-state", handleVideoState);
        socket.on("webrtc:hand-raised", handleHandRaised);
        socket.on("webrtc:hand-lowered", handleHandLowered);
        socket.on("webrtc:force-muted", handleForceMuted);
        socket.on("webrtc:force-muted-all", handleForceMutedAll);

        return () => {
            socket.off("webrtc:huddle-participants", handleHuddleParticipants);
            socket.off("webrtc:user-joined-huddle", handleUserJoinedHuddle);
            socket.off("webrtc:user-left-huddle", handleUserLeftHuddle);
            socket.off("webrtc:offer", handleOffer);
            socket.off("webrtc:answer", handleAnswer);
            socket.off("webrtc:ice-candidate", handleIceCandidate);
            socket.off("webrtc:speaking-state", handleSpeakingState);
            socket.off("webrtc:video-state", handleVideoState);
            socket.off("webrtc:hand-raised", handleHandRaised);
            socket.off("webrtc:hand-lowered", handleHandLowered);
            socket.off("webrtc:force-muted", handleForceMuted);
            socket.off("webrtc:force-muted-all", handleForceMutedAll);
        };
    }, [socket, isInHuddle, projectId, userId, userRole, getOrCreatePeerConnection, createOfferToPeer, forceMuteSelf]);

    useEffect(() => {
        const handleWindowUnload = () => {
            leaveHuddle();
            cleanupHuddle();
        };

        window.addEventListener("beforeunload", handleWindowUnload);
        window.addEventListener("unload", handleWindowUnload);
        window.addEventListener("pagehide", handleWindowUnload);

        return () => {
            window.removeEventListener("beforeunload", handleWindowUnload);
            window.removeEventListener("unload", handleWindowUnload);
            window.removeEventListener("pagehide", handleWindowUnload);
            leaveHuddle();
            cleanupHuddle();
        };
    }, [leaveHuddle, cleanupHuddle]);

    return {
        isInHuddle,
        isMuted,
        isVideoOn,
        isSpeaking,
        isHandRaised,
        huddleParticipants,
        raisedHandUserIds,
        remoteStreams,
        localStream: localStreamState,
        joinHuddle,
        leaveHuddle,
        toggleMute,
        toggleVideo,
        toggleRaiseHand,
        hostMutePeer,
        hostMuteAll,
    };
}
