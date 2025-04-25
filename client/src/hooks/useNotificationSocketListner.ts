import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

export default function useNotificationSocketListner(socket: Socket | null) {
    useEffect(() => {
        if (!socket) return

        const handleJoinApprove = (data: { message: string, roomId: string }) => {
            toast.success(data.message)
        }
        const handleJoinReject = (data: { message: string }) => {
            toast.warning(data.message)
        }

        socket.off("join-approved", handleJoinApprove)
        socket.on("join-approved", handleJoinApprove)

        socket.off("join-rejected", handleJoinReject)
        socket.on("join-rejected", handleJoinReject)

        return () => {
            socket.off("join-approved", handleJoinApprove)
            socket.off("join-rejected", handleJoinApprove)
        }

    }, [socket])
}