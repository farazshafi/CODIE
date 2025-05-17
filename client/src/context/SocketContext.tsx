import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

type SocketContextType = {
    socket: Socket | null;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export function SocketProvider({ userId, children }: { userId?: string; children: React.ReactNode }) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        socketRef.current = io(SOCKET_URL, {
            transports: ["websocket"],
            reconnectionAttempts: 3,
            autoConnect: true,
            auth: { token: userId },
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("register-user", userId);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });


        return () => {
            socket.off();
            socket.disconnect();
        };

    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    return useContext(SocketContext);
}