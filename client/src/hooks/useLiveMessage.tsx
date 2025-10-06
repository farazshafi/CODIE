import { useSocket } from "@/context/SocketContext"
import { useUserStore } from "@/stores/userStore"
import { useEffect } from "react"
import { toast } from "sonner"

type DataMessage = {
    message: string;
}

export const useLivemessage = () => {
    const { socket } = useSocket()
    const user = useUserStore((state) => state.user)
    const logout = useUserStore((state) => state.logout)

    useEffect(() => {
        if (socket && user) {

            const handleSuccessMessage = (data: DataMessage) => {
                toast.success(
                    typeof data.message === "string" ? data.message : JSON.stringify(data)
                );
            };

            const handleWarningMessage = (data: DataMessage) => {
                toast.warning(
                    typeof data.message === "string" ? data.message : JSON.stringify(data)
                );
            };

            const handleBlockUser = (data: { message: string }) => {
                toast.warning(data.message)
                logout()
            }

            // requests
            socket.on("join-approved", handleSuccessMessage);
            socket.on("approve-request", handleSuccessMessage);
            socket.on("join-rejected", handleWarningMessage);
            socket.on("request-sent", handleSuccessMessage);

            // invitations
            socket.on("join-invitation-approved", handleSuccessMessage);
            socket.on("join-invitation-rejected", handleWarningMessage);
            socket.on("recive-invitation", handleSuccessMessage);

            // user block
            socket.on("user-blocked", handleBlockUser)

            // socket.on("invitation-sent", handleSuccessMessage);

            return () => {
                // requests
                socket.off("join-approved", handleSuccessMessage);
                socket.off("approve-request", handleSuccessMessage);
                socket.off("join-rejected", handleWarningMessage);
                socket.off("request-sent", handleSuccessMessage);

                // invitations
                socket.off("join-invitation-approved", handleSuccessMessage);
                socket.off("join-invitation-rejected", handleWarningMessage);
                socket.off("recive-invitation", handleSuccessMessage);

                // user block
                socket.off("user-blocked", handleBlockUser)

                // socket.off("invitation-sent", handleSuccessMessage);
            };
        }
    }, [socket, user, logout])

}