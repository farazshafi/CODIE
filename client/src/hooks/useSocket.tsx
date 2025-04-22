import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function useSocket() {
    const [connectedSocket, setConnectedSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
                withCredentials: true,
            });
        }

        setConnectedSocket(socket);

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return connectedSocket;
}
