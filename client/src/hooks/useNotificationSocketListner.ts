import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

export default function useNotificationSocketListner(socket: Socket | null, onNotificationReceived: () => void) {
    useEffect(() => {
        if (!socket) return;

        const handleJoinApprove = (data: { message: string, roomId: string }) => {
            toast.success(data.message);
            onNotificationReceived();
        };
        
        const handleJoinReject = (data: { message: string }) => {
            toast.warning(data.message);
            onNotificationReceived();
        };

        const handleApproveRequest = (data: {
            roomId: string,
            userId: string,
            userName: string,
            reqId: string,
        }) => {
            toast.success(`New join request received from ${data.userName} to join Room: ${data.roomId}`);
            onNotificationReceived();
        };

        const handleReceiveInvitation = (data: any) => {
            toast.success(data.message || "You received an invitation");
            onNotificationReceived();
        };

        const handleRequestSent = (message: string) => {
            toast.success(message || "Request sent successfully");
            onNotificationReceived();
        };

        const handleInvitationSent = (data: { message: string }) => {
            toast.success(data.message || "Invitation sent successfully");
            onNotificationReceived();
        };

        // Generic notification received event handler
        const handleNotificationReceived = (data: any) => {
            onNotificationReceived();
        };

        // Listen for all notification events
        socket.off("join-approved").on("join-approved", handleJoinApprove);
        socket.off("approve-request").on("approve-request", handleApproveRequest);
        socket.off("join-rejected").on("join-rejected", handleJoinReject);
        socket.off("join-invitation-approved").on("join-invitation-approved", handleJoinApprove);
        socket.off("join-invitation-rejected").on("join-invitation-rejected", handleJoinReject);
        socket.off("recive-invitation").on("recive-invitation", handleReceiveInvitation);
        socket.off("request-sent").on("request-sent", handleRequestSent);
        socket.off("invitation-sent").on("invitation-sent", handleInvitationSent);
        
        // Generic notification update event
        socket.off("notification-received").on("notification-received", handleNotificationReceived);

        return () => {
            // Clean up all event listeners when component unmounts
            socket.off("join-approved", handleJoinApprove);
            socket.off("join-rejected", handleJoinReject);
            socket.off("approve-request", handleApproveRequest);
            socket.off("join-invitation-approved", handleJoinApprove);
            socket.off("join-invitation-rejected", handleJoinReject);
            socket.off("recive-invitation", handleReceiveInvitation);
            socket.off("request-sent", handleRequestSent);
            socket.off("invitation-sent", handleInvitationSent);
            socket.off("notification-received", handleNotificationReceived);
        };
    }, [socket, onNotificationReceived]);
}