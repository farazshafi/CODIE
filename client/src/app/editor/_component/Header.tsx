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
    EllipsisVertical,
    CircleSmall,
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


const Header = ({
    onChatToggle,
    onCollaboratorsToggle,
}: {
    onChatToggle: () => void;
    onCollaboratorsToggle: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [collabDropdownOpen, setCollabDropdownOpen] = useState(false);
    const [textSize, setTextSize] = useState(16);
    const [textIsOpened, setTextIsOpened] = useState(false)

    const collabRef = useRef(null)

    const { setFontSize, theme, setTheme } = useCodeEditorStore()

    const setFontChange = (newSize: number) => {
        const size = Math.min(Math.max(newSize, 12), 24);
        setFontSize(size);
        localStorage.setItem("editor-font-size", size.toString());
    }

    const collaborators = [
        {
            name: "Jhone Doe",
            role: "Owner",
            avatar:
                "data:image/jpeg;base64,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",
        },
        {
            name: "Fath Doe",
            role: "Editor",
            avatar:
                "data:image/jpeg;base64,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",
        },
        {
            name: "Sajad mohammed",
            role: "Viewer",
            avatar:
                "data:image/jpeg;base64,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",
        },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (collabRef.current && !collabRef.current.contains(event.target as Node)) {
                setCollabDropdownOpen(false)
            }
        }

        if (collabDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [collabDropdownOpen])

    useEffect(() => {
        const storedSize = localStorage.getItem("editor-font-size");
        if (storedSize) {
            setTextSize(Number(storedSize));
        }
    }, [setFontChange])

    return (
        <nav className="text-white bg-primary px-10 py-5 flex justify-between items-center relative">
            {" "}
            <div>
                <Link href="/dashboard">
                    <div className="flex flex-row items-center cursor-pointer">
                        <Image src={Logo} alt="logo" className="w-[40px]" />
                        <p className="text-xl font-semibold mt-2">
                            COD<span className="text-green-400 font-semibold">IE</span>
                        </p>
                    </div>
                </Link>
                <div className="flex gap-x-3 flex-row mt-2 items-center justify-between sm:justify-normal">
                    <div className="flex p-3 rounded-md bg-tertiary">
                        <p>
                            RoomId:{" "}
                            <span className="ml-2 px-2 hover:text-green-500 font-bold py-1 bg-white text-black rounded-md">
                                #43433
                            </span>
                        </p>
                    </div>
                    <Link
                        className="hover:bg-red-950 rounded-md hover:transition-opacity hover:duration-300 hover:ease-in-out"
                        href={"/dashboard"}
                    >
                        <Button className="bg-tertiary cursor-pointer ">
                            <LogOut/>
                            Exit
                        </Button>
                    </Link>
                </div>
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
                <div
                    className="bg-tertiary p-2 hover:scale-125 rounded-md"
                    onClick={onChatToggle}
                >
                    <MessageSquare />
                </div>

                {/* Collaborators with dropdown */}
                <div ref={collabRef} className="relative">
                    <div
                        className="bg-tertiary p-2 hover:scale-125 rounded-md cursor-pointer"
                        onClick={() => setCollabDropdownOpen((prev) => !prev)}
                    >
                        <Users />
                    </div>
                    {collabDropdownOpen && (
                        <div className="absolute top-12 right-0 w-[350px] sm:w-[500px] md:w-[600px] max-w-[90vw] h-[250px] bg-black text-white shadow-md rounded-md z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-green-400 scrollbar-track-gray-700 p-4">
                            <div className="p-4 space-y-4">
                                {collaborators.map((user, index) => (
                                    <div key={index}>
                                        <div
                                            className="hover:bg-gray-900 py-2 px-3 rounded-md flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 ring-2">
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback className="bg-green text-black font-bold text-xl">
                                                        {user.name.split(" ").map((n) => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p>{user.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-800 p-1 px-2 rounded-md">
                                                <p className="text-sm">{user.role}</p>
                                                <EllipsisVertical />
                                            </div>
                                        </div>
                                        <div className="px-2 py-1"><div className="w-full h-[2px] bg-gray-700"></div></div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    )}

                </div>

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
        </nav>
    );
};

export default Header;
