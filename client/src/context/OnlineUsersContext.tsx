"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useUserStore } from "@/stores/userStore";
import { useEditorStore } from "@/stores/editorStore";
import { toast } from "sonner";

interface OnlineUsersContextType {
    onlineUsers: string[];
    isConnected: boolean;
}

const OnlineUsersContext = createContext<OnlineUsersContextType>({
    onlineUsers: [],
    isConnected: false,
});

export const OnlineUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket, isConnected } = useSocket();
    const user = useUserStore((state) => state.user);
    const projectId = useEditorStore((state) => state.projectId);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const handleOnlineUsers = useCallback((users: string[]) => {
        setOnlineUsers(users);
    }, []);

    const handleUserJoin = useCallback(({ message }: { message: string }) => {
        toast.success(message);
    }, []);

    const handleUserLeft = useCallback(({ message }: { message: string }) => {
        toast.info(message);
    }, []);

    useEffect(() => {
        if (!socket || !user || !projectId) return;

        socket.emit("join-project", {
            userId: user.id,
            userName: user.name,
            projectId,
        });

        socket.off("online-users", handleOnlineUsers);
        socket.off("user-joined", handleUserJoin);
        socket.off("user-left", handleUserLeft);

        socket.on("online-users", handleOnlineUsers);
        socket.on("user-joined", handleUserJoin);
        socket.on("user-left", handleUserLeft);

        return () => {
            socket.off("online-users", handleOnlineUsers);
            socket.off("user-joined", handleUserJoin);
            socket.off("user-left", handleUserLeft);
        };
    }, [socket, isConnected, user, projectId, handleOnlineUsers, handleUserJoin, handleUserLeft]);

    return (
        <OnlineUsersContext.Provider value={{ onlineUsers, isConnected }}>
            {children}
        </OnlineUsersContext.Provider>
    );
};

export const useOnlineUsersContext = () => {
    return useContext(OnlineUsersContext);
};
