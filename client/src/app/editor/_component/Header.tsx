"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {
    Menu,
    X,
    LogOut,
    MessageSquare,
    Users,
    MoonStar,
    Palette,
    TypeOutline,
    CircleSmall,
    Handshake,
    UserRoundPlus,

} from "lucide-react";
import Logo from "../../../../public/logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { useCodeEditorStore } from "@/stores/useCodeEditorStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { THEMES } from "../_constants";
import { toast } from "sonner";
import { useMutationHook } from "@/hooks/useMutationHook";
import { enableCollabrationApi, getRoomByProjectIdApi, updateCollabratorRoleApi } from "@/apis/roomApi";
import { useParams } from "next/navigation";
import { Collaborator } from "@/types";
import { Input } from "@/components/ui/input";
import { searchUsersApi } from "@/apis/userApi";
import { useUserStore } from "@/stores/userStore";
import { createInvitationApi } from "@/apis/invitationApi";
import { DropdownMenuLabel, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";


type SearchResultUser = {
    name: string;
    email: string;
    id: string
}

const Header = ({
    onChatToggle,
    onCollaboratorsToggle,
}: {
    onChatToggle: () => void;
    onCollaboratorsToggle: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [textSize, setTextSize] = useState(16);
    const [textIsOpened, setTextIsOpened] = useState(false)
    const [isWantToCollab, setIsWantToCollab] = useState(false)
    const [roomId, setRoomId] = useState(null)
    const [collaborators, setCollaborators] = useState<Collaborator[]>([])
    const [showInvitationModal, setShowInvitationModal] = useState(false)
    const [searchEmail, setSearchEmail] = useState("")
    const [userResult, setUserResult] = useState([])
    const [invitedUserId, setInvitedUserId] = React.useState<string | null>(null)

    const user = useUserStore((state) => state.user)

    const params = useParams()
    const { id } = params

    const { setFontSize, theme, setTheme } = useCodeEditorStore()

    // mutations
    const { mutate } = useMutationHook(enableCollabrationApi, {
        onSuccess(res) {
            setIsWantToCollab(true)
            setRoomId(res.data.roomId)
            toast.message("Enabled collabration!")
        },
        onError(error) {
            toast.error(error?.response?.data?.message || "Something went wrong!");
        },
    })

    const { mutate: getRoomByProjectId } = useMutationHook(getRoomByProjectIdApi, {
        onSuccess(res) {
            setRoomId(res.data.roomId)
            setCollaborators(res.data.collaborators)
            setIsWantToCollab(true)
        },
        onError(error) {
            setIsWantToCollab(false)
        },
    })

    const { mutate: searchUsers, isLoading: searchUserLoading } = useMutationHook(searchUsersApi, {
        onSuccess(data) {
            setUserResult(data)
        },
        onError(error) {
            toast.error(error.response.data.message || "Search failed")
        },
    })

    const { mutate: createInvitation, isLoading: invitationLoading } = useMutationHook(createInvitationApi, {
        onSuccess(data) {
            toast.success(data.message || "Invitation sended")
            setInvitedUserId(null)
        },
        onError(error) {
            console.log(error)
            toast.error(error.response.data.message || "Invitaiton failed")
            setInvitedUserId(null)
        },
    })

    const { mutate: updateRole, isLoading: updateRoleLoading } = useMutationHook(updateCollabratorRoleApi, {
        onError(error) {
            toast.error(error.response.data.message || "Error occured while updating role")
        },
        onSuccess(data) {
            getRoomByProjectId(id)
            toast.success(data.message || "Updated Role")
        },
    })

    const setFontChange = (newSize: number) => {
        const size = Math.min(Math.max(newSize, 12), 24);
        setFontSize(size);
        localStorage.setItem("editor-font-size", size.toString());
    }

    const handleCollabration = () => {
        mutate(id)
    }

    const handleInvitation = () => {
        setShowInvitationModal(true)
    }

    const handleSearchUsers = () => {
        if (!user?.id) return

        searchUsers({ email: searchEmail, userId: user?.id })
    }

    const handleSendingInvitation = (id: string) => {
        if (!user?.id) return
        setInvitedUserId(id)
        createInvitation({ roomId, senderId: user?.id, reciverId: id })
    }

    const handleUpdateRole = (userId: string, role: string) => {
        console.log(`user: ${userId}, role : ${role}`)
        updateRole({ userId, role, roomId })
    }

    useEffect(() => {
        getRoomByProjectId(id)
    }, [isWantToCollab])

    useEffect(() => {
        const storedSize = localStorage.getItem("editor-font-size");
        if (storedSize) {
            setTextSize(Number(storedSize));
        }
    }, [setFontChange])

    useEffect(() => {
        const deleyInputTimeout = setTimeout(() => {
            handleSearchUsers()
        }, 500);
        return () => clearTimeout(deleyInputTimeout);
    }, [searchEmail])

    return (
        <nav className="text-white bg-primary px-10 py-3 flex justify-between items-center relative">
            {" "}
            <div className="flex flex-row items-center space-x-4">
                <Link href="/dashboard">
                    <div className="flex flex-row items-center cursor-pointer">
                        <Image src={Logo} alt="logo" className="w-[40px]" />
                        <p className="text-xl font-semibold mt-2">
                            COD<span className="text-green-400 font-semibold">IE</span>
                        </p>
                    </div>
                </Link>
                {isWantToCollab ? (
                    <div className="flex gap-x-3 flex-row mt-2 items-center justify-between sm:justify-normal">
                        <div className="flex p-3 rounded-md bg-tertiary">
                            <p>
                                RoomId:
                                {roomId && (
                                    <span className="ml-2 px-2 hover:text-green-500 font-bold py-1 bg-white text-black rounded-md">
                                        #{roomId}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <Button onClick={handleCollabration}
                            className="bg-gradient-to-r from-green-400 to-blue-500 cursor-pointer transition-all duration-[2000] ease-in-out hover:bg-gray-700 hover:from-gray-700 hover:to-gray-400">
                            <Handshake />
                            Enable Collaboration
                        </Button>
                    </>
                )}
                <Link
                    className="hover:bg-red-950 rounded-md hover:transition-opacity hover:duration-300 hover:ease-in-out"
                    href={"/dashboard"}
                >
                    <Button className="bg-tertiary cursor-pointer ">
                        <LogOut />
                        Exit
                    </Button>
                </Link>
            </div>
            {/* Mobile Menu */}
            <button
                className="md:hidden cursor-pointer text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="absolute top-[70px] left-0 w-full bg-primary flex flex-col p-5 mt-3 space-y-4 md:hidden">
                    <div className="bg-tertiary rounded-md" onClick={onChatToggle}>
                        <div className="flex items-center gap-2 p-2">
                            <MessageSquare />
                            <p>Chat</p>
                        </div>
                    </div>
                    <div className="bg-tertiary rounded-md">
                        <div
                            onClick={onCollaboratorsToggle}
                            className="flex items-center gap-2 p-2"
                        >
                            <Users />
                            <p>Collaborators</p>
                        </div>
                    </div>
                    <div className="bg-tertiary rounded-md">
                        <div className="flex items-center gap-2 p-2">
                            <Palette />
                            <p>Theme</p>
                        </div>
                    </div>
                    <div className="bg-tertiary rounded-md">
                        <div className="flex items-center gap-2 p-2">
                            <TypeOutline />
                            <p>Text size</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-md">
                        <div className="flex items-center gap-2 p-2">
                            <MoonStar />
                            <p>Dark</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Icons */}
            <div className="flex-row gap-x-6 hidden md:flex relative">
                {isWantToCollab && (
                    <>
                        <Button onClick={handleInvitation}
                            className="bg-gradient-to-r from-green-400 to-blue-500 cursor-pointer transition-all duration-[2000] ease-in-out hover:bg-gray-700 hover:from-gray-700 hover:to-gray-400">
                            <UserRoundPlus />
                            Invite
                        </Button>

                        <div
                            className="bg-tertiary p-2 hover:scale-125 rounded-md"
                            onClick={onChatToggle}
                        >
                            <MessageSquare />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="bg-tertiary p-2 hover:scale-125 rounded-md cursor-pointer">
                                    <Users />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[400px]">
                                <DropdownMenuLabel>
                                    <div className="text-center py-2 font-bold">
                                        <p>Collabrators</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {collaborators.map((item, index) => (
                                    <DropdownMenuItem key={index} className="flex flex-col w-full p-2 hover:bg-slate-200 focus:bg-slate-200">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage alt={item.user.name} />
                                                    <AvatarFallback className="bg-green-400 text-black font-bold text-sm">
                                                        {item.user.name.split(" ").map((n) => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{item.user.name}</p>
                                                    <p className="text-xs text-gray-500">{item.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-md text-xs ${item.role === "editor" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {item.role}
                                                </span>
                                                {user?.id !== item.user._id && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <div className="inline-flex h-7 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none">
                                                                Change Role
                                                            </div>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="bg-white">
                                                            <DropdownMenuItem
                                                                disabled={item.role === "editor" || updateRoleLoading}
                                                                onClick={() => handleUpdateRole(item.user._id, "editor")}
                                                                onSelect={(e) => e.preventDefault()} // Prevent default Radix UI close behavior
                                                                className="hover:bg-slate-100 text-sm"
                                                            >
                                                                {updateRoleLoading ? "Updating..." : "Make Editor"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                disabled={item.role === "viewer" || updateRoleLoading}
                                                                onClick={() => handleUpdateRole(item.user._id, "viewer")}
                                                                onSelect={(e) => e.preventDefault()} // Prevent default Radix UI close behavior
                                                                className="hover:bg-slate-100 text-sm"
                                                            >
                                                                Make Viewer
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}

                <div className="bg-tertiary p-2 hover:scale-125 rounded-md">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none focus:outline-none">
                            <Palette />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mt-5 bg-slate-800 text-white space-y-3 focus:outline-none outline-none">
                            {THEMES.map((t, i) => (
                                <DropdownMenuItem disabled={theme === t.id} className="hover:bg-black px-5 hover:text-white" onClick={() => setTheme(t.id)} key={i}>
                                    {t.label}
                                    {theme === t.id && (
                                        <CircleSmall className="text-white" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div onClick={() => setTextIsOpened(prev => !prev)} className={`bg-tertiary p-2 hover:scale-125 rounded-md ${textIsOpened ? "flex flex-col items-center" : ""}`}>
                    <TypeOutline />
                    {textIsOpened && (
                        <Slider
                            defaultValue={[textSize]}
                            min={12}
                            max={24}
                            step={1}
                            className="
                            w-[150px] mt-2
                            [&_.radix-slider-track]:bg-gray-400  // full track color
                            [&_.radix-slider-range]:bg-green-500 // progress color
                            [&_[role=slider]]:bg-green-500       // thumb color
                            [&_[role=slider]]:border-none"
                            onValueChange={setFontChange}
                        />
                    )}
                </div>

                <div className="bg-tertiary p-2 hover:scale-125 rounded-md">
                    <MoonStar />
                </div>
            </div>

            {
                showInvitationModal && (
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
                                                <p>{user.name}</p>
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
                                <Button variant="outline" onClick={() => setShowInvitationModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </nav >
    );
};

export default Header;