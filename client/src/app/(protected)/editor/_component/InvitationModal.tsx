import { createInvitationApi } from '@/apis/invitationApi'
import { searchUsersApi } from '@/apis/userApi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Pagination from '@/components/ui/Pagination'
import { useSocket } from '@/context/SocketContext'
import { useMutationHook } from '@/hooks/useMutationHook'
import { useUserStore } from '@/stores/userStore'
import React, { useEffect, useState, useCallback } from 'react'
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

const PAGE_SIZE = 8

const InvitationModal: React.FC<InvitationProps> = ({ roomId, hanldeModalClose }) => {
    const { socket } = useSocket()
    const user = useUserStore((state) => state.user)

    const [userResult, setUserResult] = useState<SearchResultUser[]>([])
    const [searchEmail, setSearchEmail] = useState("")
    const [invitedUserId, setInvitedUserId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState<number>(1)

    let reciverId: string | null = null

    const { mutate: createInvitation, isLoading: invitationLoading } = useMutationHook(createInvitationApi, {
        onSuccess(data) {
            toast.success(data.message || "Invitation sent")
            setInvitedUserId(null)
            if (socket && reciverId) {
                socket.emit("send-invitation", { reciverId })
            }
        },
        onError(error) {
            if (error instanceof Error) {
                toast.error(error.message || "Invitation failed");
            } else {
                toast.error(String(error));
            }
            setInvitedUserId(null)
        },
    })

    const { mutate: searchUsers, isLoading: searchUserLoading } = useMutationHook(searchUsersApi, {
        onSuccess(data) {
            // ensure typed array
            setUserResult(Array.isArray(data.data) ? data.data : [])
        },
        onError(error) {
            if (error instanceof Error) {
                toast.error(error.message || "Search failed");
            } else {
                toast.error(String(error));
            }
        },
    })

    const handleSendingInvitation = (id: string) => {
        if (!user?.id) return
        setInvitedUserId(id)
        reciverId = id
        createInvitation({ roomId, senderId: user?.id, reciverId: id })
    }

    // include searchEmail in deps so the debounce triggers search for typed input
    const handleSearchUsers = useCallback(() => {
        if (!user?.id) return
        searchUsers({ email: searchEmail, userId: user?.id })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, searchEmail])

    // debounce input -> search
    useEffect(() => {
        const delayInputTimeout = setTimeout(() => {
            handleSearchUsers()
        }, 500)
        return () => clearTimeout(delayInputTimeout)
    }, [handleSearchUsers])

    // pagination calculations
    const totalPages = Math.max(1, Math.ceil(userResult.length / PAGE_SIZE))
    // clamp currentPage if userResult changed and current page > totalPages
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1)
        // if results changed and we are on page > 1 but new results exist, keep currentPage if valid
    }, [userResult, totalPages, currentPage])

    const startIdx = (currentPage - 1) * PAGE_SIZE
    const paginatedUsers = userResult.slice(startIdx, startIdx + PAGE_SIZE)

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 text-black">
                <h2 className="text-xl font-semibold mb-4">Invite Collaborator</h2>
                <Input
                    type="text"
                    placeholder="Search for email"
                    value={searchEmail}
                    onChange={(e) => {
                        setSearchEmail(e.target.value)
                        // reset to first page when user types new search
                        setCurrentPage(1)
                    }}
                />

                {!searchUserLoading ? (
                    <div className="mt-4 space-y-2">
                        {userResult.length > 0 ? (
                            <>
                                {paginatedUsers.map((u: SearchResultUser) => (
                                    <div
                                        key={u.id}
                                        className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage alt={u.name} />
                                                <AvatarFallback className="bg-green text-black font-bold text-sm">
                                                    {u.name.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col item-center">
                                                <p>{u.name}</p>
                                                <p className="text-xs">{u.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="text-sm"
                                            disabled={invitedUserId === u.id ? invitationLoading : false}
                                            onClick={() => handleSendingInvitation(u.id)}
                                        >
                                            {invitedUserId === u.id && invitationLoading ? (
                                                <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-black rounded-full"></div>
                                            ) : (
                                                "Invite"
                                            )}
                                        </Button>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        setCurrentPage={(p) => setCurrentPage(p)}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="mt-4">
                                <p className="text-sm text-admin-muted">No users found</p>
                            </div>
                        )}
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
