import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { CircleStop, Mic, MicOff, Send, SmilePlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from '@/context/SocketContext';
import { useUserStore } from '@/stores/userStore';
import { useEditorStore } from '@/stores/editorStore';
import { useMutationHook } from '@/hooks/useMutationHook';
import { getChatMessagesApi } from '@/apis/messageApi';
import { toast } from 'sonner';
import AudioPlayer from 'react-h5-audio-player';
import AudioWaveform from './AudioWaveForm';
import EmojiPicker from 'emoji-picker-react';

interface Message {
    _id?: string;
    senderId: string;
    senderName: string;
    senderRole: 'owner' | 'editor' | 'viewer';
    content: string;
    roomId: string;
    projectId?: string;
    contentType: "text" | "audio";
}

interface ChatProps {
    userRole: 'owner' | 'editor' | 'viewer';
    chatSupport: { text: boolean; voice: boolean };
}

const roleColors = {
    owner: 'bg-yellow-300 text-black',
    editor: 'bg-blue-400 text-white',
    viewer: 'bg-gray-500 text-white',
};

const ChatArea: React.FC<ChatProps> = ({ userRole, chatSupport }) => {
    const { socket } = useSocket();
    const user = useUserStore((state) => state.user);
    const { roomId, projectId, ownerId } = useEditorStore();

    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const [enableEmoji, setEnableEmoji] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const emojiRef = useRef<HTMLDivElement>(null);

    // Audio recording state
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { mutate: getMessages } = useMutationHook(getChatMessagesApi, {
        onSuccess: setMessages,
    });

    // Convert Blob to Base64
    const blobToBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result)
                } else {
                    reject("Failed to convert blob to base64");
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    const sendVoiceMessage = useCallback(async (blob: Blob) => {
        if (!roomId || !user || !projectId || !socket) return;
        const base64Audio = await blobToBase64(blob);
        socket.emit("send-voice-message", {
            base64: base64Audio,
            roomId,
            senderId: user.id,
            senderName: user.name,
            senderRole: userRole,
            projectId,
            contentType: "audio",
        });
    }, [roomId, user, projectId, socket, userRole]);

    const startRecorder = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const audioCtx = new AudioContext();
            const analyserNode = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyserNode);

            setAudioContext(audioCtx);
            setAnalyser(analyserNode);

            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
            recorder.onstop = () => {
                sendVoiceMessage(new Blob(chunks, { type: "audio/webm" }));
                stream.getTracks().forEach((t) => t.stop());
                audioCtx.close();
                setAnalyser(null);
                setAudioContext(null);
                setRecordingTime(0);
                if (timerRef.current) {
                    clearInterval(timerRef.current)
                }
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
        } catch {
            toast.error("Failed to access microphone");
        }
    }, [sendVoiceMessage]);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
    }, []);

    const handleSend = useCallback(() => {
        if (!socket || !user || !roomId || !projectId || !messageText.trim()) return;
        socket.emit("send-message", {
            roomId,
            senderId: user.id,
            senderName: user.name,
            senderRole: userRole,
            content: messageText,
            projectId,
            contentType: "text",
        });
        setMessageText("");
        console.log("audio contects", audioContext)
    }, [socket, user, roomId, projectId, messageText, userRole]);

    const handleVoiceWarning = useCallback(() => {
        toast.info(
            user?.id === ownerId
                ? "Please upgrade your plan"
                : "Owner does not have access. Contact the owner for an upgrade."
        );
    }, [user, ownerId]);

    const handleEmojiClick = useCallback((emojiData: { emoji: string }) => {
        setMessageText((prev) => prev + emojiData.emoji);
    }, []);

    useEffect(() => {
        if (roomId) {
            getMessages(roomId);
        }
    }, [roomId, getMessages]);

    useEffect(() => {
        if (!socket || !roomId) return;
        const handleMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);
        socket.on("receive_message", handleMessage);
        return () => {
            socket.off("receive_message", handleMessage);
        };
    }, [socket, roomId]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    useEffect(() => {
        if (!enableEmoji) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
                setEnableEmoji(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [enableEmoji]);

    return (
        <div className="bg-tertiary text-center overflow-auto py-5 flex flex-col justify-between gap-y-5 h-full px-5">
            <p className="text-white text-center text-3xl font-semibold">Chat With Collaborators</p>

            {/* Role Legend */}
            <div className="flex justify-center items-center gap-x-4 text-white text-sm">
                {["owner", "editor", "viewer"].map((role) => (
                    <div key={role} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${roleColors[role].split(" ")[0]}`}></div>
                        <span className="capitalize">{role}</span>
                    </div>
                ))}
            </div>

            {/* Chat Messages */}
            <div className="h-[500px] w-full bg-primary rounded-lg px-5 py-3">
                <div className="h-[80%] flex flex-col gap-y-5 overflow-y-auto pr-2 relative">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className="flex max-w-[80%] items-start gap-3">
                                    {showAvatar && (
                                        <Avatar title={msg.senderName}>
                                            <AvatarImage src={isMe ? user?.avatar : "https://github.com/shadcn.png"} />
                                            <AvatarFallback>{msg.senderName.slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    {msg.contentType === "audio" ? (
                                        <div className={`rounded w-[300px] ${roleColors[msg.senderRole]}`}>
                                            <AudioPlayer
                                                src={msg.content}
                                                showJumpControls={false}
                                                customAdditionalControls={[]}
                                                customVolumeControls={[]}
                                                layout="horizontal-reverse"
                                                style={{ borderRadius: '10px', background: 'transparent' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className={`rounded px-4 py-2 whitespace-pre-wrap w-fit max-w-full ${roleColors[msg.senderRole]}`}>
                                            <p>{msg.content}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Chat Input */}
                <div className="h-fit gap-x-3 px-5 py-3 bg-white flex items-center justify-between rounded-md relative">
                    <SmilePlus
                        size={40}
                        className={`${enableEmoji ? "bg-gray-700 text-white" : ""} hover:bg-gray-600 transition p-1 cursor-pointer rounded-full text-black`}
                        onClick={() => setEnableEmoji((p) => !p)}
                    />
                    {isRecording ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                            <AudioWaveform analyser={analyser} />
                            <span className="text-sm text-black font-mono">
                                ⏺ {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                            </span>
                        </div>
                    ) : (
                        <Input
                            placeholder="Message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isRecording}
                        />
                    )}
                    <div className="flex gap-x-5 items-center">
                        <div
                            onClick={!chatSupport.voice ? handleVoiceWarning : isRecording ? stopRecording : startRecorder}
                            className={`px-3 py-2 rounded-md transition ${chatSupport.voice ? 'bg-green hover:bg-green-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            {isRecording ? <CircleStop /> : chatSupport.voice ? <Mic /> : <MicOff />}
                        </div>
                        <div
                            onClick={handleSend}
                            className="bg-primary text-white px-3 py-2 rounded-md cursor-pointer"
                        >
                            <Send />
                        </div>
                    </div>
                    {enableEmoji && (
                        <div ref={emojiRef} className="absolute bottom-[130px] right-[20%] z-50">
                            <EmojiPicker onEmojiClick={handleEmojiClick} open={enableEmoji} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
