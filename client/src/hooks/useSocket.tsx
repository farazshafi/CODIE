import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export default function useSocket(userId?: string) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        if (!socket) {
            socket = io(SOCKET_URL, {
                transports: ["websocket"],
                reconnectionAttempts: 3,
                auth: { token: userId },
            });

            socket.on("connect", () => {
                console.log("Socket connected:", socket?.id);
                setIsConnected(true);
                socket?.emit("register-user", userId);
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            });
        }

        return () => {
            if (socket) {
                socket.off();
                socket.disconnect();
                socket = null;
            }
        };
    }, [userId]);

    return { socket, isConnected };
}
