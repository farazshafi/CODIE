"use client";

import React, { useState } from "react";
import { useWebRTCContext } from "@/context/WebRTCContext";
import { useEditorStore } from "@/stores/editorStore";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Hand, Mic, MicOff, MoreVertical, PhoneOff, Radio, Users, Video, VideoOff, VolumeX } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useOnlineUsers } from "@/hooks/useOnlineUsers";

interface AudioHuddleControlProps {
    onVideoToggle?: () => void;
}

const AudioHuddleControl: React.FC<AudioHuddleControlProps> = ({ onVideoToggle }) => {
    const projectId = useEditorStore((state) => state.projectId);
    const userRole = useEditorStore((state) => state.userRole);
    const user = useUserStore((state) => state.user);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const { onlineUsers } = useOnlineUsers(projectId || undefined);

    const {
        isInHuddle,
        isMuted,
        isVideoOn,
        isSpeaking,
        isHandRaised,
        huddleParticipants,
        raisedHandUserIds,
        joinHuddle,
        leaveHuddle,
        toggleMute,
        toggleVideo,
        toggleRaiseHand,
        hostMutePeer,
        hostMuteAll,
    } = useWebRTCContext();

    const handleVideoClick = () => {
        toggleVideo();
        if (onVideoToggle) {
            onVideoToggle();
        }
    };

    // Combine current user with huddle participants ensuring no duplicates
    const allParticipants = React.useMemo(() => {
        if (!user) return [];
        const selfInParticipants = huddleParticipants.find((p) => p.userId === user.id);
        const selfObj = {
            userId: user.id,
            socketId: "self",
            userName: user.name || "You",
            isMuted,
            isSpeaking,
            isVideoOn,
            hasHandRaised: isHandRaised,
            isSelf: true,
        };

        const otherList = huddleParticipants
            .filter((p) => p.userId !== user.id)
            .map((p) => ({
                ...p,
                hasHandRaised: p.hasHandRaised || raisedHandUserIds.includes(p.userId),
                isSelf: false,
            }));

        return selfInParticipants ? [selfObj, ...otherList] : [selfObj, ...otherList];
    }, [user, huddleParticipants, raisedHandUserIds, isMuted, isSpeaking, isVideoOn, isHandRaised]);

    const raisedHandList = allParticipants.filter((p) => p.hasHandRaised);

    if (!projectId || !user) return null;

    // If only 1 user is online in the room and not currently in a huddle, hide Join Huddle button
    if (onlineUsers.length <= 1 && !isInHuddle) {
        return null;
    }

    const isHost = userRole === "owner";

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                {!isInHuddle ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={joinHuddle}
                                size="sm"
                                className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium gap-2 px-3 py-1.5 h-8 text-xs border border-emerald-500/30 shadow-md shadow-emerald-950/20 transition-all active:scale-95"
                            >
                                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
                                <span>Join Huddle</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-xs">
                            Connect to live call with room collaborators
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <div className="flex items-center gap-2 bg-[#12131c] border border-emerald-500/30 px-2.5 py-1 rounded-lg shadow-lg animate-in fade-in duration-200">
                        {/* Huddle Live Status */}
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pr-1.5 border-r border-white/10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="hidden sm:inline">Huddle</span>
                        </div>

                        {/* Mute Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={toggleMute}
                                    size="icon"
                                    variant="ghost"
                                    className={`w-7 h-7 rounded-md transition-colors ${isMuted
                                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                        : isSpeaking
                                            ? "bg-emerald-500/40 text-emerald-200 border border-emerald-400 ring-2 ring-emerald-400/50 animate-pulse"
                                            : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                                        }`}
                                >
                                    {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-xs">
                                {isMuted ? "Unmute Microphone" : "Mute Microphone"}
                            </TooltipContent>
                        </Tooltip>

                        {/* Video Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleVideoClick}
                                    size="icon"
                                    variant="ghost"
                                    className={`w-7 h-7 rounded-md transition-colors ${isVideoOn
                                        ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400 ring-2 ring-emerald-400/40"
                                        : "bg-tertiary/60 text-gray-400 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    {isVideoOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-xs">
                                {isVideoOn ? "Turn Off Camera" : "Turn On Camera / Open Video Drawer"}
                            </TooltipContent>
                        </Tooltip>

                        {/* Raise Hand Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={toggleRaiseHand}
                                    size="icon"
                                    variant="ghost"
                                    className={`w-7 h-7 rounded-md transition-all ${isHandRaised
                                        ? "bg-amber-500/30 text-amber-300 border border-amber-500/50 ring-2 ring-amber-400/40 animate-bounce"
                                        : "bg-tertiary/60 text-gray-400 hover:text-amber-300 hover:bg-amber-500/20"
                                        }`}
                                >
                                    <Hand className="w-3.5 h-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-xs">
                                {isHandRaised ? "Lower Hand" : "Raise Hand (Request to speak)"}
                            </TooltipContent>
                        </Tooltip>

                        {/* Host Moderation: Mute All */}
                        {isHost && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={hostMuteAll}
                                        size="icon"
                                        variant="ghost"
                                        className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 active:scale-95 transition-all"
                                    >
                                        <VolumeX className="w-3.5 h-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-xs">
                                    Host Action: Mute All Participants
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {/* Participant Avatars */}
                        <div className="flex items-center -space-x-1.5 pl-1 border-l border-white/10">
                            {huddleParticipants.length === 0 ? (
                                <div className={`relative w-6 h-6 rounded-full bg-emerald-600/80 border border-[#12131c] flex items-center justify-center text-[10px] font-bold text-white transition-all ${isSpeaking ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#12131c]" : ""}`}>
                                    {user.name?.substring(0, 2).toUpperCase() || "ME"}
                                    {isHandRaised && (
                                        <span className="absolute -top-1 -right-1 text-[9px]">✋</span>
                                    )}
                                </div>
                            ) : (
                                huddleParticipants.slice(0, 3).map((participant, index) => {
                                    const hasHandUp = participant.hasHandRaised || raisedHandUserIds.includes(participant.userId);
                                    return (
                                        <Tooltip key={participant.userId || index}>
                                            <TooltipTrigger asChild>
                                                <div className={`relative w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border border-[#12131c] flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-all ${participant.isSpeaking ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#12131c]" : "ring-1 ring-emerald-500/50"}`}>
                                                    {participant.userName?.substring(0, 2).toUpperCase() || "U"}
                                                    {hasHandUp && (
                                                        <span className="absolute -top-1 -right-1 text-[9px] animate-bounce">✋</span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-xs">
                                                {participant.userName} {participant.isSpeaking ? "(Speaking)" : ""} {hasHandUp ? "✋ Hand Raised" : ""}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })
                            )}
                            {huddleParticipants.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-tertiary border border-[#12131c] flex items-center justify-center text-[9px] font-bold text-gray-300">
                                    +{huddleParticipants.length - 3}
                                </div>
                            )}
                        </div>

                        {/* 3-dot Menu Button to Open Participants & Hand Raises Modal */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => setIsParticipantsModalOpen(true)}
                                    size="icon"
                                    variant="ghost"
                                    className="w-6 h-6 ml-0.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all active:scale-95 border border-white/10"
                                >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-xs">
                                View Joined Users & Raised Hands
                            </TooltipContent>
                        </Tooltip>

                        {/* Leave Huddle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={leaveHuddle}
                                    size="icon"
                                    variant="ghost"
                                    className="w-7 h-7 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 active:scale-95 transition-all"
                                >
                                    <PhoneOff className="w-3.5 h-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-xs">
                                Leave Audio Huddle
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {/* Participants & Hand Raise Modal */}
                <Dialog open={isParticipantsModalOpen} onOpenChange={setIsParticipantsModalOpen}>
                    <DialogContent className="bg-[#12131c] border-emerald-500/30 text-white max-w-sm rounded-xl p-4 shadow-2xl">
                        <DialogHeader className="pb-2 border-b border-white/10">
                            <DialogTitle className="flex items-center justify-between text-sm font-semibold text-gray-100">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-emerald-400" />
                                    <span>Huddle Participants</span>
                                </div>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {allParticipants.length} Joined
                                </span>
                            </DialogTitle>
                        </DialogHeader>

                        {/* Raised Hands Banner if any */}
                        {raisedHandList.length > 0 && (
                            <div className="mt-3 p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-lg space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                                    <Hand className="w-3.5 h-3.5 animate-bounce" />
                                    <span>Raised Hands ({raisedHandList.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {raisedHandList.map((p) => (
                                        <span
                                            key={p.userId}
                                            className="inline-flex items-center gap-1 text-[11px] bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded-md font-medium"
                                        >
                                            ✋ {p.userName} {p.isSelf ? "(You)" : ""}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Participants List */}
                        <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto pr-1">
                            {allParticipants.map((p) => {
                                const pMuted = p.isSelf ? isMuted : p.isMuted;
                                const pSpeaking = p.isSelf ? isSpeaking : p.isSpeaking;

                                return (
                                    <div
                                        key={p.userId}
                                        className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className={`relative w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${pSpeaking ? "ring-2 ring-emerald-400" : ""
                                                    }`}
                                            >
                                                {p.userName?.substring(0, 2).toUpperCase() || "U"}
                                                {p.hasHandRaised && (
                                                    <span className="absolute -top-1 -right-1 text-[10px]">✋</span>
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-xs font-medium text-gray-200 truncate flex items-center gap-1.5">
                                                    <span>{p.userName}</span>
                                                    {p.isSelf && (
                                                        <span className="text-[10px] text-emerald-400 font-semibold">(You)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {p.hasHandRaised && (
                                                <span className="text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5">
                                                    ✋ Raised
                                                </span>
                                            )}

                                            {pSpeaking && (
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                            )}

                                            {pMuted ? (
                                                <MicOff className="w-3.5 h-3.5 text-red-400" />
                                            ) : (
                                                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                                            )}

                                            {isHost && !p.isSelf && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => hostMutePeer(p.userId, p.socketId)}
                                                            size="icon"
                                                            variant="ghost"
                                                            className="w-5 h-5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                        >
                                                            <VolumeX className="w-3 h-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-[#1e1e2e] border-white/10 text-white text-[10px]">
                                                        Host: Mute {p.userName}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default AudioHuddleControl;
