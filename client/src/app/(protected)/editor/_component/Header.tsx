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
import { useParams } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import RoomRequests from "./RoomRequests";
import Contributers from "./Contributers";
import CollaborationSection from "./CollaborationSection";
import { useEditorStore } from "@/stores/editorStore";
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
    const [chatSupport, setChatSupport] = useState({ text: true, voice: true })

    const roomId = useEditorStore((state) => state.roomId)
    const ownerId = useEditorStore((state) => state.ownerId)
    const user = useUserStore((state) => state.user)

    const params = useParams()
    const { id } = params

    const { setFontSize, theme, setTheme } = useCodeEditorStore()

    const { mutate: getUserSubscription } = useMutationHook(getUserSubscriptionApi, {
        onSuccess(data) {
            setChatSupport({
                text: data.data.text,
                voice: data.data.voice
            })
        },
        onError(error) {
            console.log("server error", error)
        },
    })

    const setFontChange = React.useCallback((newSize: number[]) => {
        const size = Math.min(Math.max(newSize[0], 12), 24);
        setFontSize(size);
        localStorage.setItem("editor-font-size", size.toString());
    }, [setFontSize]);

    const handleSubscription = () => {
        if (ownerId === user?.id) {
            toast.info("Please upgrade Your Plan")
        } else {
            toast.info("Owner does not have access to this feature. Please contact the owner for an upgrade.")
        }
    }

    useEffect(() => {
        if (ownerId) {
            getUserSubscription(ownerId);
        }
    }, [ownerId]);

    useEffect(() => {
        const storedSize = typeof window !== "undefined"
            ? localStorage.getItem("editor-font-size")
            : null;
        if (storedSize) {
            setTextSize(Number(storedSize));
        }
    }, []);

    return (
        <nav className="text-white bg-primary px-4 md:px-10 py-3 flex justify-between items-center relative border-b border-white/5">
            <div className="flex flex-row items-center space-x-6">
                <Link href="/dashboard" className="flex flex-row items-center cursor-pointer group">
                    <Image src={Logo} alt="logo" className="w-[35px] md:w-[40px] group-hover:scale-110 transition-transform" />
                    <p className="text-lg md:text-xl font-bold ml-2">
                        COD<span className="text-green-400">IE</span>
                    </p>
                </Link>

                <div className="hidden md:flex items-center gap-x-4">
                    <CollaborationSection />
                    
                    <Link
                        className="hover:opacity-80 transition-opacity"
                        href={"/dashboard"}
                    >
                        <Button variant="ghost" className="bg-tertiary/50 hover:bg-red-500/20 text-white">
                            <LogOut className="w-4 h-4 mr-2" />
                            Exit
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
                 <Link href="/dashboard">
                    <Button size="icon" variant="ghost" className="bg-tertiary/50">
                        <LogOut className="w-5 h-5 text-red-400" />
                    </Button>
                </Link>
                <button
                    className="cursor-pointer text-white p-2 hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="absolute top-[65px] left-0 w-full bg-[#0a0a0c] border-b border-white/10 flex flex-col p-4 z-50 md:hidden space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
                    <MobileMenuItem icon={<MessageSquare />} label="Chat" onClick={() => onChatToggle(chatSupport)} />
                    <MobileMenuItem icon={<Users />} label="Collaborators" onClick={onCollaboratorsToggle} />
                    <MobileMenuItem icon={<Palette />} label="Theme" />
                    <MobileMenuItem icon={<TypeOutline />} label="Text Size" />
                    <MobileMenuItem icon={<MoonStar />} label="Dark Mode" />
                </div>
            )}

            {/* Desktop Tools */}
            <div className="hidden md:flex flex-row items-center gap-x-4">
                {roomId && ownerId === user?.id && <RoomRequests roomID={roomId} />}

                {roomId && (
                    <>
                        <div
                            className="bg-tertiary p-2 hover:bg-tertiary/80 cursor-pointer rounded-md transition-all active:scale-95"
                            onClick={chatSupport.text ? () => onChatToggle(chatSupport) : handleSubscription}
                        >
                            {chatSupport.text ? <MessageSquare className="w-5 h-5" /> : <MessageSquareOff className="w-5 h-5 opacity-50" />}
                        </div>
                        <Contributers ownerId={ownerId} />
                    </>
                )}

                <div className="bg-tertiary p-2 hover:bg-tertiary/80 cursor-pointer rounded-md transition-all">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none focus:outline-none flex items-center">
                            <Palette className="w-5 h-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mt-2 bg-[#1e1e2e] border-white/10 text-white min-w-[150px]">
                            {THEMES.map((t, i) => (
                                <DropdownMenuItem 
                                    disabled={theme === t.id} 
                                    className="hover:bg-white/10 cursor-pointer flex justify-between items-center" 
                                    onClick={() => setTheme(t.id)} 
                                    key={i}
                                >
                                    {t.label}
                                    {theme === t.id && <CircleSmall className="text-green-400" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="relative">
                    <div 
                        onClick={() => setTextIsOpened(prev => !prev)} 
                        className={`bg-tertiary p-2 hover:bg-tertiary/80 cursor-pointer rounded-md transition-all ${textIsOpened ? "bg-white/10" : ""}`}
                    >
                        <TypeOutline className="w-5 h-5" />
                    </div>
                    {textIsOpened && (
                        <div className="absolute top-full right-0 mt-3 p-4 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl z-50 w-[200px]">
                            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">Font Size: {textSize}px</p>
                            <Slider
                                defaultValue={[textSize]}
                                min={12}
                                max={24}
                                step={1}
                                className="[&_.radix-slider-track]:bg-gray-700 [&_.radix-slider-range]:bg-green-500 [&_[role=slider]]:bg-green-500"
                                onValueChange={setFontChange}
                            />
                        </div>
                    )}
                </div>

                <div className="bg-tertiary p-2 hover:bg-tertiary/80 cursor-pointer rounded-md transition-all">
                    <MoonStar className="w-5 h-5" />
                </div>
            </div>
        </nav >
    );
};

const MobileMenuItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className="flex items-center gap-3 p-3 rounded-lg bg-tertiary/30 hover:bg-tertiary/50 active:bg-tertiary cursor-pointer transition-colors"
    >
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        <p className="text-sm font-medium">{label}</p>
    </div>
)


export default Header;