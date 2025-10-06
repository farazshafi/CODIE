import { useSocket } from "@/context/SocketContext";
import { useEffect } from "react";

export default function useNotificationSocketListner(onNotificationReceived: () => void, refetchProjects: () => void) {
    const { socket } = useSocket()

    useEffect(() => {
        if (!socket) return;

        const fetchData = () => {
            onNotificationReceived();
        };
        const fetchProjects = () => {
            onNotificationReceived()
            refetchProjects()
        }

        // requests
        socket.on("join-approved", fetchProjects);
        socket.on("approve-request", fetchData);
        socket.on("join-rejected", fetchData);
        socket.on("request-sent", fetchData);


        // invitations
        socket.on("join-invitation-approved", fetchProjects);
        socket.on("join-invitation-rejected", fetchData);
        socket.on("recive-invitation", fetchData);


        // socket.on("notification-received", fetchData);

        return () => {
            // requests
            socket.off("join-approved", fetchProjects);
            socket.off("approve-request", fetchData);
            socket.off("join-rejected", fetchData);
            socket.off("request-sent", fetchData);


            // invitations
            socket.off("join-invitation-approved", fetchProjects);
            socket.off("join-invitation-rejected", fetchData);
            socket.off("recive-invitation", fetchData);

            // socket.off("notification-received", fetchData);
        };
    }, [socket, onNotificationReceived, refetchProjects]);
}