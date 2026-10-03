import { useOnlineUsersContext } from "@/context/OnlineUsersContext";

export const useOnlineUsers = (_projectId?: string | undefined) => {
    const context = useOnlineUsersContext();

    return {
        onlineUsers: context?.onlineUsers || [],
        isConnected: context?.isConnected || false,
    };
};
