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
            setRequests(data)
        },
        onError(error) {
            toast.error(error.message || "Error while getting requets")
        }
    })

    const handleApproveRequest = (requestId: string, roomId: string) => {
        if (!socket) return;

        socket.emit("approve-user", { requestId, roomId });
        mutate(roomId)
    };

    const handleRejectRequest = (requestId: string) => {
        if (!socket) return;

        socket.emit("reject-user", { requestId });
    };

    useEffect(() => {
        mutate(roomID)
    }, [])

    useEffect(() => {
        if (!socket) return;

        const handleUpdateRequest = () => {
            setHasUnread(true);
            mutate(roomID);
        };

        socket.on("notification-received", handleUpdateRequest);

        return () => {
            socket.off("notification-received", handleUpdateRequest);
        };
    }, [socket, roomID]);




    return (
        <div className=''>
            <DropdownMenu onOpenChange={(isOpen) => {
                if(isOpen) setHasUnread(false)
            }}>
                <DropdownMenuTrigger>
                    <div className="relative bg-tertiary p-2 hover:scale-125 rounded-md cursor-pointer">
                        <Inbox />
                        {hasUnread && (
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        )}
                    </div>

                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[400px]">
                    <DropdownMenuLabel>
                        <div className="text-center py-2 font-bold">
                            <p>Requests</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {requests.length < 1 ? (
                        <DropdownMenuItem className="p-2 text-center text-sm text-gray-500">
                            No requests found
                        </DropdownMenuItem>
                    ) : (
                        requests.map((item, index) => (
                            <DropdownMenuItem key={index} className="flex flex-col w-full p-2 hover:bg-slate-200 focus:bg-slate-200">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage alt={item.name} />
                                            <AvatarFallback className="bg-green-400 text-black font-bold text-sm">
                                                {item.name.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex flex-row items-center space-x-3">
                                                <p className="font-medium">{item.name}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{item.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span onClick={() => handleApproveRequest(item.id, roomID)} className="px-2 py-1 rounded-md text-xs bg-green">
                                            Accept
                                        </span>
                                        <span onClick={() => handleRejectRequest(item.id)} className="px-2 py-1 rounded-md text-xs bg-red-400">
                                            Reject
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}

                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    )
}

export default RoomRequests