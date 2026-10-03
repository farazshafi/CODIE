"use client";

import React, { createContext, useContext } from "react";
import { useWebRTC, HuddleParticipant } from "@/hooks/useWebRTC";
import { useEditorStore } from "@/stores/editorStore";
import { useUserStore } from "@/stores/userStore";

interface WebRTCContextType {
    isInHuddle: boolean;
    isMuted: boolean;
    isVideoOn: boolean;
    isSpeaking: boolean;
    isHandRaised: boolean;
    huddleParticipants: HuddleParticipant[];
    raisedHandUserIds: string[];
    remoteStreams: { [peerKey: string]: MediaStream };
    localStream: MediaStream | null;
    hasRecentHuddleJoin: boolean;
    joinHuddle: () => Promise<void>;
    leaveHuddle: () => void;
    toggleMute: () => void;
    toggleVideo: () => Promise<void>;
    toggleRaiseHand: () => void;
    hostMutePeer: (targetUserId: string, targetSocketId?: string) => void;
    hostMuteAll: () => void;
}

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const projectId = useEditorStore((state) => state.projectId);
    const userRole = useEditorStore((state) => state.userRole);
    const user = useUserStore((state) => state.user);

    const webrtc = useWebRTC({
        projectId: projectId || undefined,
        userId: user?.id,
        userName: user?.name,
        userRole: userRole || "editor",
    });

    return (
        <WebRTCContext.Provider value={webrtc}>
            {children}
        </WebRTCContext.Provider>
    );
};

export const useWebRTCContext = () => {
    const context = useContext(WebRTCContext);
    if (!context) {
        throw new Error("useWebRTCContext must be used within a WebRTCProvider");
    }
    return context;
};
