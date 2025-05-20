"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
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
import Logo from "../../../../../public/logo.png";
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
import { searchUsersApi } from "@/apis/userApi";
import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/context/SocketContext";
import RoomRequests from "./RoomRequests";
import Contributers from "./Contributers";
import InvitationModal from "./InvitationModal";


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
    const [userResult, setUserResult] = useState([])
    const [ownerId, setOwnerId] = useState("")
    const user = useUserStore((state) => state.user)
    const { socket } = useSocket()


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
            setOwnerId(res.data.owner)
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


    const handleUpdateRole = (userId: string, role: string) => {
        updateRole({ userId, role, roomId })
    }

    const hanldeModalClose = () => {
        setShowInvitationModal(false)
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
        if (!socket) return
        const refetchCollabrators = () => {
            getRoomByProjectId(id)
        }
        socket.on("update-request", refetchCollabrators)

        return () => {
            socket.off("update-request", refetchCollabrators)
        }
    }, [socket, id])

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

                {/* Inbox */}
                {roomId && ownerId === user?.id && <RoomRequests roomID={roomId} />}

                {isWantToCollab && (
                    <>
                        {/* invite btn */}
                        {user?.id === ownerId && <Button onClick={handleInvitation}
                            className="bg-gradient-to-r from-green-400 to-blue-500 cursor-pointer transition-all duration-[2000] ease-in-out hover:bg-gray-700 hover:from-gray-700 hover:to-gray-400">
                            <UserRoundPlus />
                            Invite
                        </Button>}

                        {/* mesage */}
                        <div
                            className="bg-tertiary p-2 hover:scale-125 rounded-md"
                            onClick={onChatToggle}
                        >
                            <MessageSquare />
                        </div>

                        <Contributers handleUpdateRole={handleUpdateRole} isRoleLoading={updateRoleLoading} ownerId={ownerId} collaborators={collaborators} />
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
                showInvitationModal && roomId && (
                    <InvitationModal hanldeModalClose={hanldeModalClose} roomId={roomId} />
                )
            }
        </nav >
    );
};

export default Header;