// hooks/useJoinRequestListener.ts
import { useEffect } from "react";
import { toast } from "sonner";
import { Socket } from "socket.io-client";

export default function useJoinRequestListener(socket: Socket | null) {
  useEffect(() => {
    if (!socket) return;

    const handleRequestSent = (message: string) => toast.success(message);
    const handleError = (message: string) => toast.error(message);

    socket.off("request-sent", handleRequestSent);
    socket.off("error", handleError);

    socket.on("request-sent", handleRequestSent);
    socket.on("error", handleError);

    return () => {
      socket.off("request-sent", handleRequestSent);
      socket.off("error", handleError);
    };
  }, [socket]);
}
