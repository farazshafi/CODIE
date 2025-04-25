"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Logo from "../../../public/logo.png";
import Link from "next/link";
import { Menu, X, LogOut, User, LogIn, Banknote, Bell, CircleX, CircleCheckBig } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useMutationHook } from "@/hooks/useMutationHook";
import { getAllRecivedRequestApi, getAllSendedRequestApi } from "@/apis/requestApi";
import useNotificationSocketListner from "@/hooks/useNotificationSocketListner";
import useSocket from "@/hooks/useSocket";

const Navbar = () => {
    const user = useUserStore((state) => state.user);
    const logout = useUserStore((state) => state.logout);
    const router = useRouter();
    const isActive = (path: string) => pathname === path;


    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [sendedData, setSendedData] = useState([])
    const [recivedData, setRecivedData] = useState([])
    const [profileOpen, setProfileOpen] = useState(false);
    const { socket, isConnected } = useSocket(user?.id);
    useNotificationSocketListner(socket)


    //functions
    const handleLogout = () => {
        setIsLoading(true);
        logout();
        router.push("/login");
        setIsLoading(false);
    };

    const handleApproveRequest = (requestId: string, roomId: string) => {
        if (!socket) return

        socket.emit("approve-user", { requestId, roomId })
    }

    const handleRejectRequest = (requestId: string) => {
        if (!socket) return

        socket.emit("reject-user", { requestId })
    }

    const { mutate: getAllSndReq } = useMutationHook(getAllSendedRequestApi, {
        onSuccess(res) {
            setSendedData(res.data)
        },
    })
    const { mutate: getAllRecReq } = useMutationHook(getAllRecivedRequestApi, {
        onSuccess(res) {
            setRecivedData(res)
        },
    })

    // useEffects
    useEffect(() => {
        if (user?.id) {
            getAllSndReq(user?.id)
            getAllRecReq(user?.id)
        }
    }, [user?.id])



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
                        {/* Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                {user && user.token ? (
                                    <Button variant="outline" className="w-auto cursor-pointer">
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
                            )}
                        </DropdownMenu>
                    </div>
                </div>
            )}

            {/* Desktop */}
            <div className="text-black hidden md:flex space-x-3 items-center">

                {/* Notification Bell */}
                <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
                    <DropdownMenuTrigger asChild>
                        <div className="relative">
                            <Bell
                                size={30}
                                className="text-white cursor-pointer"
                                onClick={() => setNotificationOpen(!notificationOpen)}
                            />
                            {sendedData.length > 0 || recivedData.length > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                                    {sendedData.length + recivedData.length}
                                </span>
                            )}
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-full">
                        <Tabs defaultValue="sent" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-2">
                                <TabsTrigger value="sent">Sent</TabsTrigger>
                                <TabsTrigger value="received">Received</TabsTrigger>
                            </TabsList>

                            <TabsContent value="sent">
                                {sendedData.length > 0 ? sendedData.map((item: any) => (
                                    <DropdownMenuItem key={item._id}>
                                        <p className="text-sm"> You made a request to <span className="mygreen font-bold">{item?.reciverId?.name}</span> to join in room: <span className="font-bold mygreen">{item.roomId}</span></p>
                                    </DropdownMenuItem>

                                )) : <p className="text-center text-sm text-gray-500">No Request</p>}
                            </TabsContent>

                            <TabsContent className="space-y-3.5" value="received">
                                {recivedData.length > 0 ? recivedData.map((item: any) => (
                                    <DropdownMenuItem key={item._id}>
                                        <p className="text-sm"> <span className="mygreen font-bold">{item?.senderId?.name}</span> Requested to join in room: <span className="font-bold mygreen">{item.roomId}</span></p>
                                        <Button onClick={() => handleApproveRequest(item._id, item.roomId)}><CircleCheckBig color="white" /></Button>
                                        <Button onClick={() => handleRejectRequest(item._id)} variant={"destructive"}><CircleX color="white" /></Button>
                                    </DropdownMenuItem>
                                )) : <p className="text-center text-sm text-gray-500">No Request</p>}
                            </TabsContent>
                        </Tabs>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {user && user.token ? (
                            <Button variant="outline" className="w-auto cursor-pointer">
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
                    )}
                </DropdownMenu>

            </div>
        </nav>
    );
};

export default Navbar;
