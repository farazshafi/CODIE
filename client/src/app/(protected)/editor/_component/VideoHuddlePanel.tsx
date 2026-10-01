"use client";

import React from "react";
import VideoTile from "./VideoTile";
import { Button } from "@/components/ui/button";
import { Hand, Mic, MicOff, PhoneOff, Video, VideoOff, VolumeX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWebRTCContext } from "@/context/WebRTCContext";
import { useUserStore } from "@/stores/userStore";
import { useEditorStore } from "@/stores/editorStore";

const VideoHuddlePanel: React.FC = () => {
    const user = useUserStore((state) => state.user);
    const userRole = useEditorStore((state) => state.userRole);
    const isHost = userRole === "owner";

    const {
        isInHuddle,
        isMuted,
        isVideoOn,
        isSpeaking,
        isHandRaised,
        localStream,
        huddleParticipants,
        remoteStreams,
        raisedHandUserIds,
        toggleMute,
        toggleVideo,
        toggleRaiseHand,
        hostMuteAll,
        leaveHuddle,
    } = useWebRTCContext();

    // Filter out local user from remote participants to prevent tile duplication
    const remoteParticipants = React.useMemo(() => {
        if (!user) return huddleParticipants;
        return huddleParticipants.filter((p) => p.userId && p.userId !== user.id);
    }, [user, huddleParticipants]);

    if (!isInHuddle) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 bg-[#0d0e15]">
                <Video className="w-12 h-12 text-emerald-500/50 mb-3 animate-pulse" />
                <h3 className="text-base font-semibold text-white mb-1">Audio & Video Huddle</h3>
                <p className="text-xs text-gray-400 max-w-xs mb-4">
                    Join the room huddle to talk and share video with team collaborators in real time.
                </p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="h-full flex flex-col bg-[#0d0e15] border-l border-white/10 text-white overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#12131c]">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <h2 className="text-sm font-semibold text-white">Live Video Huddle</h2>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {remoteParticipants.length + 1} Connected
                    </span>
                </div>

                {/* Video Tiles Grid */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                    {/* Local User Tile */}
                    <VideoTile
                        userId={user?.id || "me"}
                        userName={user?.name || "You"}
                        isLocal={true}
                        isVideoOn={isVideoOn}
                        isMuted={isMuted}
                        isSpeaking={isSpeaking}
                        hasHandRaised={isHandRaised}
                        stream={localStream}
                    />

                    {/* Remote Participants */}
                    {remoteParticipants.map((participant) => {
                        const peerKey = participant.userId || participant.socketId;
                        const peerStream = remoteStreams[peerKey] || null;
                        const hasHandUp = participant.hasHandRaised || raisedHandUserIds.includes(participant.userId);

                        return (
                            <VideoTile
                                key={peerKey}
                                userId={participant.userId}
                                userName={participant.userName}
                                isLocal={false}
                                isVideoOn={participant.isVideoOn}
                                isMuted={participant.isMuted}
                                isSpeaking={participant.isSpeaking}
                                hasHandRaised={hasHandUp}
                                stream={peerStream}
                            />
                        );
                    })}
                </div>

                {/* Quick Action Toolbar */}
                <div className="p-3 border-t border-white/10 bg-[#12131c] flex items-center justify-around gap-1.5">
                    {/* Mute Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={toggleMute}
                                size="icon"
                                variant="ghost"
                                className={`w-9 h-9 rounded-lg transition-colors ${isMuted
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                                    }`}
                            >
                                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1e1e2e] text-white text-xs">
                            {isMuted ? "Unmute Mic" : "Mute Mic"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Video Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={toggleVideo}
                                size="icon"
                                variant="ghost"
                                className={`w-9 h-9 rounded-lg transition-colors ${isVideoOn
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 ring-2 ring-emerald-400/40"
                                    : "bg-gray-800 text-gray-400 border border-white/10 hover:text-white"
                                    }`}
                            >
                                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1e1e2e] text-white text-xs">
                            {isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Raise Hand Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={toggleRaiseHand}
                                size="icon"
                                variant="ghost"
                                className={`w-9 h-9 rounded-lg transition-all ${isHandRaised
                                    ? "bg-amber-500/30 text-amber-300 border border-amber-500/50 ring-2 ring-amber-400/40 animate-bounce"
                                    : "bg-gray-800 text-gray-400 border border-white/10 hover:text-amber-300"
                                    }`}
                            >
                                <Hand className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1e1e2e] text-white text-xs">
                            {isHandRaised ? "Lower Hand" : "Raise Hand"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Host Moderation Mute All */}
                    {isHost && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={hostMuteAll}
                                    size="icon"
                                    variant="ghost"
                                    className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                                >
                                    <VolumeX className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1e1e2e] text-white text-xs">
                                Host Action: Mute All
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Disconnect */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={leaveHuddle}
                                size="icon"
                                variant="ghost"
                                className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                            >
                                <PhoneOff className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1e1e2e] text-white text-xs">
                            Leave Huddle
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default VideoHuddlePanel;
