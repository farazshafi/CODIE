"use client";
import Image from "next/image";
import React, { useState } from "react";
import Logo from "../../../public/logo.png";
import Link from "next/link";
import { Menu, X, LogOut, User, CreditCard, LogIn, Banknote } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const user = useUserStore((state) => state.user)
    const logout = useUserStore((state) => state.logout)

    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()

    const handleLogout = () => {
        setIsLoading(true)
        logout()
        router.push("/login")
        setIsLoading(false)
    }

    const isActive = (path: string) => pathname === path;

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#1f2125]">
                <p className="text-white text-lg">Redirecting...</p>
            </div>
        );
    }

    return (
        <nav className="text-white bg-primary px-10 py-5 flex justify-between items-center">

            <Link href="/dashboard">
                <div className="flex items-center cursor-pointer">
                    <Image src={Logo} alt="logo" className="w-[80px]" />
                    <p className="text-2xl font-semibold mt-2">
                        COD<span className="text-green-400 font-semibold">IE</span>
                    </p>
                </div>
            </Link>


            <div className="hidden md:flex gap-10">
                <Link href="/dashboard" className={isActive("/") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>Home</Link>
                <Link href="/discover" className={isActive("/discover") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>Discover</Link>
                <Link href="/profile" className={isActive("/profile") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>Profile</Link>
                <Link href="/plan" className={isActive("/plan") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>Plan</Link>
                <Link href="/about" className={isActive("/about") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>About</Link>
            </div>

            <button
                className="md:hidden cursor-pointer text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>

            {isOpen && (
                <div className="absolute top-[70px] left-0 w-full bg-primary flex flex-col p-5 mt-3 space-y-4 md:hidden">
                    <Link href="/dashboard" className={isActive("/") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>Home</Link>
                    <Link href="/discover" className={isActive("/discover") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>Discover</Link>
                    <Link href="/profile" className={isActive("/profile") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>Profile</Link>
                    <Link href="/plan" className={isActive("/plan") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>Plan</Link>
                    <Link href="/about" className={isActive("/about") ? "text-green-400 font-bold cursor-pointer" : "cursor-pointer"}>About</Link>

                    <div className="text-black">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>

                                {user && user.token ? (
                                    <Button variant="outline" className="w-full cursor-pointer">
                                        {user.name}
                                        <Avatar className="ml-2">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>US</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                ) : (
                                    <Link className="cursor-pointer" href={"/login"}>
                                        <Button variant="outline" className="w-full">
                                            <LogIn />
                                            Log In
                                        </Button>
                                    </Link>
                                )}

                            </DropdownMenuTrigger>
                            {user && (
                                <>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => router.push("/profile")}>
                                                <User />
                                                <span>Profile</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push("/plan")}>
                                                <Banknote />
                                                <span>Plan</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <LogOut />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </>
                            )}
                        </DropdownMenu>
                    </div>
                </div>
            )}

            {/* Desktop */}
            <div className="text-black hidden md:flex">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {user && user.token ? (
                            <Button variant="outline" className="w-full cursor-pointer">
                                {user.name}
                                <Avatar className="ml-2">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>US</AvatarFallback>
                                </Avatar>
                            </Button>
                        ) : (
                            <Link className="cursor-pointer" href={"/login"}>
                                <Button variant="outline" className="w-full cursor-pointer">
                                    <LogIn />
                                    Log In
                                </Button>
                            </Link>
                        )}
                    </DropdownMenuTrigger>
                    {user && (
                        <>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                                        <User />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push("/plan")}>
                                        <Banknote />
                                        <span>Plan</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                                    <LogOut />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </>
                    )}
                </DropdownMenu>
            </div>
        </nav>
    );
};

export default Navbar;
