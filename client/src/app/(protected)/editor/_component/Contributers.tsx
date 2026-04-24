import { getContributersApi, updateCollabratorRoleApi } from '@/apis/roomApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useSocket } from '@/context/SocketContext';
import { useMutationHook } from '@/hooks/useMutationHook';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useEditorStore } from '@/stores/editorStore';
import { useUserStore } from '@/stores/userStore';
import { Users } from 'lucide-react'
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';


type SearchResultUser = {
    name: string;
    email: string;
    _id: string;
};

type Collaborator = {
    user: SearchResultUser;
    role: string;
    _id: string;
};

type ContributersProps = {
    ownerId: string;
    isModal?: boolean;
};



const Contributers: React.FC<ContributersProps> = ({ ownerId, isModal = false }) => {
    const params = useParams()

    const { id: projectId } = params
    const { onlineUsers } = useOnlineUsers(projectId?.toString())
    const user = useUserStore((state) => state.user);
    const { socket } = useSocket()
    const roomId = useEditorStore((state) => state.roomId)
    const setUserRole = useEditorStore((state) => state.setUserRole)


    const [collaborators, setCollaborators] = useState<Collaborator[]>([])


    const isUserOnline = (userId: string, onlineUsers: string[]): boolean => {
        return onlineUsers?.includes(userId);
    };


    const { mutate: getContributers } = useMutationHook(getContributersApi, {
        onSuccess(res) {
            console.log("collaborators data: ", res.data)
            setCollaborators(res.data)
            const me = res.data.find((u: Collaborator) => u.user._id === user?.id)
            if (me) {
                setUserRole(me.role)
            }
        },
    })
    const { mutate: updateRole, isLoading: isRoleLoading } = useMutationHook(updateCollabratorRoleApi, {
        onError: (error: unknown) => {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong, while updating role");
            }
        },
        onSuccess(data, variables) {
            if (!variables) return
            getContributers(projectId as string)

            socket?.emit("notify-role-change", {
                userId: variables.userId,
                role: variables.role,
                projectId,
            });
        },
    })

    const handleUpdateRole = (userId: string, role: "viewer" | "editor") => {
        if (!roomId) return
        updateRole({ userId, role, roomId })
    }

    useEffect(() => {
        if (!socket || !projectId) return
        getContributers(projectId as string)

        const handleUpdateRole = (data: { message: string, }) => {
            toast.info(data.message)
            getContributers(projectId as string)
        }

        socket.on("updated-role", handleUpdateRole)
        socket.on("contributors-updated", () => {
            toast.success("new Contributer Accepted")
            getContributers(projectId as string)
        });

        return () => {
            socket.off("updated-role", handleUpdateRole)
            socket.off("contributors-updated", () => {
                toast.success("New Contributer Accepted")
                getContributers(projectId as string)
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, projectId])

    const ListContent = (
        <div className={`flex flex-col w-full ${isModal ? 'bg-transparent' : ''}`}>
            {!isModal && (
                <>
                    <DropdownMenuLabel>
                        <div className="text-center py-2 font-bold">
                            <p>Collabrators</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                </>
            )}
            <div className={`space-y-1 ${isModal ? 'max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                {collaborators.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No collaborators found.
                    </div>
                )}
                {collaborators.map((item, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isModal ? 'bg-white/5 hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-white/10">
                                <AvatarImage src={item.user._id === user?.id ? user?.avatar : ""} alt={item.user.name} />
                                <AvatarFallback className={`text-black font-bold text-sm ${isUserOnline(item.user._id, onlineUsers) ? 'bg-green-400' : 'bg-red-400'
                                    }`}>
                                    {item.user.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">{item.user.name}</p>
                                    {isUserOnline(item.user._id, onlineUsers) ? (
                                        <span className="w-2 h-2 rounded-full bg-green-500" title="online" />
                                    ) : (
                                        <span className="w-2 h-2 rounded-full bg-red-500" title="offline" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">{item.user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${item.role === "owner" ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                                item.role === "editor" ? "bg-green-500/20 text-green-500 border border-green-500/30" :
                                    "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                                }`}>
                                {item.role}
                            </span>

                            {ownerId === user?.id && item.role !== "owner" && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="h-7 px-2 text-[10px] font-medium rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                                            Role
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#1e1e2e] border-white/10 text-white">
                                        <DropdownMenuItem
                                            disabled={item.role === "editor" || isRoleLoading}
                                            onClick={() => handleUpdateRole(item.user._id, "editor")}
                                            className="hover:bg-white/10 cursor-pointer"
                                        >
                                            {isRoleLoading ? "Updating..." : "Make Editor"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            disabled={item.role === "viewer" || isRoleLoading}
                                            onClick={() => handleUpdateRole(item.user._id, "viewer")}
                                            className="hover:bg-white/10 cursor-pointer"
                                        >
                                            Make Viewer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {!isModal && <DropdownMenuSeparator />}
        </div>
    );

    if (isModal) return ListContent;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="bg-tertiary p-2 hover:scale-125 rounded-md cursor-pointer">
                    <Users />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] bg-[#1e1e2e] border-white/10 text-white">
                {ListContent}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default Contributers