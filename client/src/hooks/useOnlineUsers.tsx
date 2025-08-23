import { useSocket } from "@/context/SocketContext"
import { useUserStore } from "@/stores/userStore"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"


export const useOnlineUsers = (projectId: string | undefined) => {
    const { socket, isConnected } = useSocket()
    const user = useUserStore((state) => state.user)
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])

    const handleOnlineUsers = useCallback((onlineUsers: string[]) => {
        setOnlineUsers(onlineUsers);
    }, []);

    const handleUserJoin = useCallback(({ message }: { message: string }) => {
        toast.success(message);
    }, []);

    const handleUserLeft = useCallback(({ message }: { message: string }) => {
        toast.info(message)
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

            console.log("header disconnect: ")
            socket.off("online-users", handleOnlineUsers);
            socket.off("user-joined", handleUserJoin);
            socket.off("user-left", handleUserLeft);
        };
    }, [socket, isConnected, user, projectId, handleOnlineUsers, handleUserJoin, handleUserLeft]);

    return {
        onlineUsers,
        isConnected,
    }
}
