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
    MessageSquareOff,

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
import { enableCollabrationApi, getRoomByProjectIdApi } from "@/apis/roomApi";
import { useParams } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/context/SocketContext";
import RoomRequests from "./RoomRequests";
import Contributers from "./Contributers";
import InvitationModal from "./InvitationModal";
import { useEditorStore } from "@/stores/editorStore";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { getUserSubscriptionApi } from "@/apis/userSubscriptionApi";


const Header = ({
    onChatToggle,
    onCollaboratorsToggle,
}: {
    onChatToggle: (chatSupport: { text: boolean, voice: boolean }) => void;
    onCollaboratorsToggle: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [textSize, setTextSize] = useState(16);
    const [textIsOpened, setTextIsOpened] = useState(false)
    const [isWantToCollab, setIsWantToCollab] = useState(false)
    const [showInvitationModal, setShowInvitationModal] = useState(false)
    const [ownerId, setOwnerId] = useState("")
    const [copyMessage, setCopyMessage] = useState("")
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [chatSupport, setChatSupport] = useState({ text: true, voice: true })

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);


    const roomId = useEditorStore((state) => state.roomId)
    const setRoomId = useEditorStore((state) => state.setRoomId)
    const user = useUserStore((state) => state.user)
    const storeOnwerId = useEditorStore((state) => state.setOwnerId)
    const { socket } = useSocket()

    const params = useParams()
    const { id } = params

    const { setFontSize, theme, setTheme } = useCodeEditorStore()

    // mutations
    const { mutate } = useMutationHook(enableCollabrationApi, {
        onSuccess(res) {
            setIsWantToCollab(true)
            setRoomId(res.data.data.roomId)
            toast.message("Enabled collabration!")

        },
        onError(error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error(String(error));
            }
        },
    })

    const { mutate: getRoomByProjectId } = useMutationHook(getRoomByProjectIdApi, {
        onSuccess(res) {
            console.log("get room by project id: data", res.data)
            setRoomId(res.data.roomId)
            setIsWantToCollab(true)
            setOwnerId(res.data.owner)
            storeOnwerId(res.data.owner)
        },
        onError(error) {
            console.log("room getting error: ", error)
            setIsWantToCollab(false)
        },
    })

    const { mutate: getUserSubscription } = useMutationHook(getUserSubscriptionApi, {
        onSuccess(data) {
            console.log(data.data.text)
            setChatSupport({
                text: data.data.text,
                voice: data.data.voice
            })
        }, onError(error) {
            console.log("server error", error)
        },
    })

    const setFontChange = React.useCallback((newSize: number[]) => {
        const size = Math.min(Math.max(newSize[0], 12), 24);
        setFontSize(size);
        localStorage.setItem("editor-font-size", size.toString());
    }, [setFontSize]);


    const handleCollabration = () => {
        mutate(id as string)
    }

    const handleSubscription = () => {
        if (ownerId === user?.id) {
            toast.info("Please upgrade Your Plan")
        } else {
            toast.info("Owner does not have access to this feature. Please contact the owner for an upgrade.")
        }
    }

    const handleInvitation = () => {
        setShowInvitationModal(true)
    }

    const hanldeModalClose = () => {
        setShowInvitationModal(false)
    }

    useEffect(() => {
        if (ownerId) {
            getUserSubscription(ownerId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerId]);



    const copyRoomId = async () => {
        if (!roomId) return;

        try {
            await navigator.clipboard.writeText(roomId);
            setCopyMessage("Copied!");
        } catch {
            setCopyMessage("Failed to copy!");
        }

        setTooltipOpen(false);
        setTimeout(() => {
            setTooltipOpen(true);
        }, 0);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setCopyMessage("Click to copy");
            setTooltipOpen(false);
        }, 2000);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (id) {
            getRoomByProjectId(id as string);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWantToCollab]);


    useEffect(() => {
        const storedSize = typeof window !== "undefined"
            ? localStorage.getItem("editor-font-size")
            : null;

        if (storedSize) {
            setTextSize(Number(storedSize));
        }
    }, []);



    useEffect(() => {
        if (!socket) return;

        const refetchCollabrators = () => {
            if (id) getRoomByProjectId(id as string);
        };

        socket.on("update-request", refetchCollabrators);

        return () => {
            socket.off("update-request", refetchCollabrators);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, id]);


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
                                    <Tooltip open={tooltipOpen}>
                                        <TooltipTrigger asChild>
                                            <span
                                                onClick={copyRoomId}
                                                className="ml-2 px-2 cursor-pointer hover:text-green-500 font-bold py-1 bg-white text-black rounded-md"
                                            >
                                                #{roomId}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{copyMessage}</p>
                                        </TooltipContent>
                                    </Tooltip>

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
                    <div className="bg-tertiary rounded-md" onClick={() => onChatToggle(chatSupport)}>
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
                            onClick={chatSupport.text ? () => onChatToggle(chatSupport) : handleSubscription}
                        >
                            {chatSupport.text ? <MessageSquare /> : <MessageSquareOff />}

                        </div>

                        <Contributers ownerId={ownerId} />
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