"use client";

import React, { useEffect, useRef } from "react";
import { Hand, Maximize2, MicOff, Minimize2 } from "lucide-react";

interface VideoTileProps {
    userName: string;
    userId: string;
    isLocal?: boolean;
    isVideoOn?: boolean;
    isMuted?: boolean;
    isSpeaking?: boolean;
    hasHandRaised?: boolean;
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
    stream?: MediaStream | null;
}

const VideoTile: React.FC<VideoTileProps> = ({
    userName,
    isLocal = false,
    isVideoOn = false,
    isMuted = false,
    isSpeaking = false,
    hasHandRaised = false,
    isMaximized = false,
    onToggleMaximize,
    stream = null,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const hasVideoTrack = Boolean(
        stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks().some((t) => t.enabled)
    );

    const shouldShowVideo = isVideoOn || hasVideoTrack;

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => { });
        }
    }, [stream, shouldShowVideo]);

    return (
        <div
            className={`relative w-full aspect-video rounded-xl bg-[#151622] border overflow-hidden shadow-lg transition-all duration-300 flex items-center justify-center ${isMaximized
                ? "border-emerald-400 ring-2 ring-emerald-400/60 col-span-full shadow-emerald-950/60 z-10"
                : isSpeaking
                    ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-950/40"
                    : "border-white/10 hover:border-white/20"
                }`}
        >
            {/* Live Video Feed */}
            {shouldShowVideo && stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
                />
            ) : (
                /* Camera OFF Avatar Fallback */
                <div className="flex flex-col items-center justify-center gap-2 p-2">
                    <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border border-white/20 flex items-center justify-center text-sm sm:text-base font-bold text-white shadow-md transition-all ${isSpeaking ? "ring-4 ring-emerald-400/60 scale-105" : ""
                            }`}
                    >
                        {userName ? userName.substring(0, 2).toUpperCase() : "U"}
                    </div>
                </div>
            )}

            {/* Top-Left Name Badge */}
            <div className="absolute top-2 left-2 bg-[#0c0d14]/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-200 font-medium z-10 max-w-[70%] truncate">
                <span className="truncate">{isLocal ? `${userName} (You)` : userName}</span>
            </div>

            {/* Top-Right Action & State Badges */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                {hasHandRaised && (
                    <div className="bg-amber-500/90 text-amber-950 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 animate-bounce shadow-md">
                        <Hand className="w-3 h-3" />
                        <span className="hidden sm:inline">Hand</span>
                    </div>
                )}
                {isMuted && (
                    <div className="bg-red-500/80 text-white p-1 rounded-md backdrop-blur-md border border-red-400/30">
                        <MicOff className="w-3 h-3" />
                    </div>
                )}
                {onToggleMaximize && (
                    <button
                        onClick={onToggleMaximize}
                        title={isMaximized ? "Minimize View" : "Maximize View"}
                        className="bg-black/60 hover:bg-black/90 text-gray-200 hover:text-white p-1 rounded-md border border-white/15 transition-all active:scale-95"
                    >
                        {isMaximized ? <Minimize2 className="w-3.5 h-3.5 text-emerald-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>

            {/* Bottom Speaking Bar Indicator */}
            {isSpeaking && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-400 animate-pulse z-10" />
            )}
        </div>
    );
};

export default VideoTile;
