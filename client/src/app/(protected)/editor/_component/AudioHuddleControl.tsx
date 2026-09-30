"use client";

import React from "react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useEditorStore } from "@/stores/editorStore";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Hand, Mic, MicOff, PhoneOff, Radio, VolumeX } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const AudioHuddleControl: React.FC = () => {
    const projectId = useEditorStore((state) => state.projectId);
    const userRole = useEditorStore((state) => state.userRole);
    const user = useUserStore((state) => state.user);

    const {
        isInHuddle,
        isMuted,
        isSpeaking,
        isHandRaised,
        huddleParticipants,
        raisedHandUserIds,
        joinHuddle,
        leaveHuddle,
        toggleMute,
        toggleRaiseHand,
        hostMuteAll,
    } = useWebRTC({
        projectId: projectId || undefined,
        userId: user?.id,
        userName: user?.name,
        userRole: userRole || "editor",
    });

    if (!projectId || !user) return null;

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
                            Connect to live WebRTC audio huddle with room collaborators
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
            </div>
        </TooltipProvider>
    );
};

export default AudioHuddleControl;
