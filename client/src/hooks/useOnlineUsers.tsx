import { useSocket } from "@/context/SocketContext"
import { useUserStore } from "@/stores/userStore"
import { useEffect, useState } from "react"


export const useOnlineUsers = (projectId: string | undefined) => {
    const { socket, isConnected } = useSocket()
    const user = useUserStore((state) => state.user)
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])

    useEffect(() => {
        if (socket && user) {
            socket.emit("join-project", {
                userId: user.id,
                userName: user.name,
                projectId,
            })

            socket.on("online-users", (onlineUsers: string[]) => {
                setOnlineUsers(onlineUsers)
            })

            return () => {
                socket.off("online-users")
            }
        }
    }, [socket, isConnected, user, projectId])

    return {
        onlineUsers,
        isConnected,
    }
}
