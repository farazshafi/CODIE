import { createInvitationApi } from '@/apis/invitationApi'
import { searchUsersApi } from '@/apis/userApi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSocket } from '@/context/SocketContext'
import { useMutationHook } from '@/hooks/useMutationHook'
import { useUserStore } from '@/stores/userStore'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

type InvitationProps = {
    roomId: string;
    hanldeModalClose(): void;
}

type SearchResultUser = {
    name: string;
    email: string;
    id: string;
};


const InvitationModal: React.FC<InvitationProps> = ({ roomId, hanldeModalClose }) => {
    const { socket } = useSocket()
    const user = useUserStore((state) => state.user)

    const [userResult, setUserResult] = useState([])
    const [searchEmail, setSearchEmail] = useState("")
    const [invitedUserId, setInvitedUserId] = React.useState<string | null>(null)
    let reciverId: string | null = null


    const { mutate: createInvitation, isLoading: invitationLoading } = useMutationHook(createInvitationApi, {
        onSuccess(data) {
            toast.success(data.message || "Invitation sended")
            setInvitedUserId(null)
            if (socket) {
                socket.emit("send-invitation", { reciverId })
            }
        },
        onError(error) {
            console.log(error)
            toast.error(error.response.data.message || "Invitaiton failed")
            setInvitedUserId(null)
        },
    })
    const { mutate: searchUsers, isLoading: searchUserLoading } = useMutationHook(searchUsersApi, {
        onSuccess(data) {
            setUserResult(data.data)
        },
        onError(error) {
            toast.error(error.response.data.message || "Search failed")
        },
    })

    const handleSendingInvitation = (id: string) => {
        if (!user?.id) return
        setInvitedUserId(id)
        reciverId = id
        createInvitation({ roomId, senderId: user?.id, reciverId: id })
    }

    const handleSearchUsers = () => {
        if (!user?.id) return
        searchUsers({ email: searchEmail, userId: user?.id })
    }

    useEffect(() => {
        const deleyInputTimeout = setTimeout(() => {
            handleSearchUsers()
        }, 500);
        return () => clearTimeout(deleyInputTimeout);
    }, [searchEmail])

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 text-black">
                <h2 className="text-xl font-semibold mb-4">Invite Collaborator</h2>
                <Input
                    type="text"
                    placeholder="Search for email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                />

                {!searchUserLoading ? (
                    <div className="mt-4 space-y-2">
                        {userResult.length > 0 && userResult.map((user: SearchResultUser, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-2"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage alt={user.name} />
                                        <AvatarFallback className="bg-green text-black font-bold text-sm">
                                            {user.name.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col item-center">
                                        <p>{user.name}</p>
                                        <p className="text-xs">{user.email}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="text-sm"
                                    disabled={invitedUserId === user.id ? invitationLoading : false}
                                    onClick={() => handleSendingInvitation(user.id)}
                                >
                                    {invitedUserId === user.id && invitationLoading ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-black rounded-full"></div>
                                    ) : (
                                        "Invite"
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-4 space-y-2">
                        {[...Array(3)].map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-2 animate-pulse"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gray-300 rounded-full" />
                                    <div className="h-4 w-24 bg-gray-300 rounded" />
                                </div>
                                <div className="h-6 w-16 bg-gray-300 rounded" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end mt-4 gap-2">
                    <Button variant="outline" onClick={hanldeModalClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default InvitationModal