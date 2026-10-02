import { getRequetsByRoom } from '@/apis/requestApi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useSocket } from '@/context/SocketContext'
import { useMutationHook } from '@/hooks/useMutationHook'
import { Inbox } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ReqData = {
    senderId: string;
    name: string;
    email: string;
    id: string;
}

const RoomRequests = ({ roomID }: { roomID: string }) => {
    const { socket } = useSocket()
    const [requests, setRequests] = useState<ReqData[]>([])
    const [hasUnread, setHasUnread] = useState(false);

    const { mutate } = useMutationHook(getRequetsByRoom, {
        onSuccess(data) {
            setRequests(data.data)
        },
        onError(error) {
            if (error instanceof Error) {
                toast.error(error.message || "Error while getting request");
            } else {
                toast.error(String(error));
            }
        }
    })

    const handleApproveRequest = (requestId: string, roomId: string) => {
        if (!socket) return;

        socket.emit("approve-user", { requestId, roomId });
        mutate(roomId);
    };

    const handleRejectRequest = (requestId: string) => {
        if (!socket) return;

        socket.emit("reject-user", { requestId });
        mutate(roomID);
    };

    useEffect(() => {
        if (roomID) {
            mutate(roomID);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomID]);

    useEffect(() => {
        if (!socket) return;

        const handleUpdateRequest = (data?: { message?: string }) => {
            setHasUnread(true);
            mutate(roomID);
            if (data?.message) {
                toast.info(data.message);
            }
        };

        socket.on("notification-received", handleUpdateRequest);
        socket.on("approve-request", handleUpdateRequest);
        socket.on("update-request", handleUpdateRequest);

        return () => {
            socket.off("notification-received", handleUpdateRequest);
            socket.off("approve-request", handleUpdateRequest);
            socket.off("update-request", handleUpdateRequest);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, roomID]);

    return (
        <div className=''>
            <DropdownMenu onOpenChange={(isOpen) => {
                if (isOpen) setHasUnread(false);
            }}>
                <DropdownMenuTrigger asChild>
                    <div className="relative bg-tertiary p-2 hover:bg-tertiary/80 rounded-md cursor-pointer text-white transition-all active:scale-95">
                        <Inbox className="w-5 h-5" />
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#12131c]"></span>
                            </span>
                        )}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[400px] bg-[#1e1e2e] border-white/10 text-white">
                    <DropdownMenuLabel>
                        <div className="text-center py-2 font-bold text-sm">
                            <p>Collaborator Requests</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {requests.length < 1 ? (
                        <DropdownMenuItem className="p-4 text-center text-sm text-gray-400 justify-center">
                            No pending requests
                        </DropdownMenuItem>
                    ) : (
                        requests.map((item, index) => (
                            <DropdownMenuItem key={index} className="flex flex-col w-full p-3 hover:bg-white/5 focus:bg-white/5 cursor-default">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage alt={item.name} />
                                            <AvatarFallback className="bg-green-400 text-black font-bold text-sm">
                                                {item.name ? item.name.split(" ").map((n) => n[0]).join("") : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-white">{item.name}</p>
                                            <p className="text-xs text-gray-400">{item.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApproveRequest(item.id, roomID)}
                                            className="px-2.5 py-1 rounded-md text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(item.id)}
                                            className="px-2.5 py-1 rounded-md text-xs bg-red-600 hover:bg-red-500 text-white font-medium transition-colors cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default RoomRequests