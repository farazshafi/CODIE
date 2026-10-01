"use client";

import React, { useEffect, useRef } from "react";
import { Hand, MicOff } from "lucide-react";

interface VideoTileProps {
    userName: string;
    userId: string;
    isLocal?: boolean;
    isVideoOn?: boolean;
    isMuted?: boolean;
    isSpeaking?: boolean;
    hasHandRaised?: boolean;
    stream?: MediaStream | null;
}

const VideoTile: React.FC<VideoTileProps> = ({
    userName,
    isLocal = false,
    isVideoOn = false,
    isMuted = false,
    isSpeaking = false,
    hasHandRaised = false,
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
            className={`relative w-full aspect-video rounded-xl bg-[#151622] border overflow-hidden shadow-lg transition-all duration-200 flex items-center justify-center ${isSpeaking
                ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-950/40"
                : "border-white/10"
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
                <div className="flex flex-col items-center justify-center gap-2">
                    <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border border-white/20 flex items-center justify-center text-lg font-bold text-white shadow-md transition-all ${isSpeaking ? "ring-4 ring-emerald-400/60 scale-105" : ""
                            }`}
                    >
                        {userName ? userName.substring(0, 2).toUpperCase() : "U"}
                    </div>
                </div>
            )}

            {/* Top-Left Name Badge */}
            <div className="absolute top-2 left-2 bg-[#0c0d14]/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1.5 text-[11px] text-gray-200 font-medium z-10">
                <span>{isLocal ? `${userName} (You)` : userName}</span>
            </div>

            {/* Top-Right Badges (Muted & Hand Raised) */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                {hasHandRaised && (
                    <div className="bg-amber-500/90 text-amber-950 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 animate-bounce shadow-md">
                        <Hand className="w-3 h-3" />
                        <span>Hand Raised</span>
                    </div>
                )}
                {isMuted && (
                    <div className="bg-red-500/80 text-white p-1 rounded-md backdrop-blur-md border border-red-400/30">
                        <MicOff className="w-3 h-3" />
                    </div>
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
