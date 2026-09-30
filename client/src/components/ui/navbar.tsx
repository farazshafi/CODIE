"use client";
import Image from "next/image";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
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
import { getRecivedInvitationsApi } from "@/apis/invitationApi";
import { useSocket } from "@/context/SocketContext";
import { logoutUserApi } from "@/apis/userApi";
import { toast } from "sonner";


type NavbarProps = {
    refetchProjects?(): void;

}

type RequestData = {
    _id: string;
    roomId: string;
    senderId?: { name: string };
    reciverId?: { name: string };
};

type InvitationData = {
    _id: string;
    roomId: string;
    senderId?: { name: string };
};


const Navbar = forwardRef((props: NavbarProps, ref) => {
    const { refetchProjects } = props;

    const user = useUserStore((state) => state.user);
    const logout = useUserStore((state) => state.logout);
    const router = useRouter();
    const isActive = (path: string) => pathname === path;
    const { socket } = useSocket();

    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [sendedData, setSendedData] = useState<RequestData[]>([]);
    const [recivedData, setRecivedData] = useState<RequestData[]>([]);
    const [recivedInvitation, setRecivedInvitation] = useState<InvitationData[]>([]);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);



    const { mutate: logoutUser } = useMutationHook(logoutUserApi, {
        onSuccess() {
            logout();
            router.push("/login");
            toast.success("Thank you for your Support!")
        }
    })


    //functions
    const handleLogout = () => {
        setIsLoading(true);
        logoutUser()
        setIsLoading(false);
    };

    const handleApproveRequest = (requestId: string, roomId: string) => {
        if (!socket) return;

        socket.emit("approve-user", { requestId, roomId });
        updateNotificationData();
    };

    const handleRejectRequest = (requestId: string) => {
        if (!socket) return;

        socket.emit("reject-user", { requestId });
        updateNotificationData();
    };

    const handleApproveInvitation = (invitationId: string, roomId: string) => {
        if (!socket) return;
        socket.emit("approve-invitation", { invitationId, roomId });
        updateNotificationData();
    };

    const handleRejectInvitation = (invitationId: string) => {
        if (!socket) return;

        socket.emit("reject-invitation", { invitationId });
        updateNotificationData();
    };

    const handleNotificationOpen = (open: boolean) => {
        setNotificationOpen(open);
        if (open) {
            setHasNewNotifications(false);
        }
    };

    const { mutate: getAllSndReq } = useMutationHook(getAllSendedRequestApi, {
        onSuccess(res) {
            setSendedData(res?.data || []);
        },
    });

    const { mutate: getAllRecReq } = useMutationHook(getAllRecivedRequestApi, {
        onSuccess(res) {
            setRecivedData(res?.data || []);
        },
    });

    const { mutate: getRecInvitations } = useMutationHook(getRecivedInvitationsApi, {
        onSuccess(data) {
            setRecivedInvitation(data?.data || []);
        },
    });
    const updateNotificationCount = useCallback(() => {
        const totalCount = sendedData.length + recivedData.length + recivedInvitation.length;
        setNotificationCount(totalCount);
    }, [sendedData, recivedData, recivedInvitation]);

    const updateNotificationData = useCallback(() => {
        if (user?.id) {
            getAllSndReq(user.id);
            getAllRecReq(user.id);
            getRecInvitations(user.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);


    useImperativeHandle(ref, () => ({
        updateNotificationData,
    }))

    useNotificationSocketListner(updateNotificationData, refetchProjects ?? (() => { }));


    // useEffects
    useEffect(() => {
        if (user?.id) {
            updateNotificationData();
        }
    }, [user, updateNotificationData]);

    useEffect(() => {
        updateNotificationCount();
    }, [sendedData, recivedData, recivedInvitation, updateNotificationCount]);

    useEffect(() => {
        if (notificationCount > 0) {
            setHasNewNotifications(true);
        }
    }, [notificationCount]);

    const notificationMenuContent = (
        <DropdownMenuContent align="end" className="w-80 sm:w-[380px] p-3 text-black shadow-xl">
            <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="received">
                        Received {recivedData.length + recivedInvitation.length > 0 && `(${recivedData.length + recivedInvitation.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="sent">
                        Sent {sendedData.length > 0 && `(${sendedData.length})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="received" className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {recivedData.length > 0 || recivedInvitation.length > 0 ? (
                        <>
                            {recivedData.map((item: RequestData) => (
                                <div key={item._id} className="flex flex-col items-start p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <p className="text-sm mb-2 text-gray-800 leading-snug">
                                        <span className="font-semibold text-green-600">{item?.senderId?.name || "User"}</span> requested to join room: <span className="font-bold text-green-700">{item.roomId}</span>
                                    </p>
                                    <div className="flex gap-2 w-full justify-end">
                                        <Button size="sm" onClick={() => handleApproveRequest(item._id, item.roomId)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs cursor-pointer">
                                            <CircleCheckBig size={14} className="mr-1" /> Accept
                                        </Button>
                                        <Button size="sm" onClick={() => handleRejectRequest(item._id)} variant="destructive" className="px-3 py-1 h-8 text-xs cursor-pointer">
                                            <CircleX size={14} className="mr-1" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {recivedInvitation.map((item: InvitationData) => (
                                <div key={item._id} className="flex flex-col items-start p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <p className="text-sm mb-2 text-gray-800 leading-snug">
                                        <span className="font-semibold text-green-600">{item?.senderId?.name || "User"}</span> invited you to join room: <span className="font-bold text-green-700">{item.roomId}</span>
                                    </p>
                                    <div className="flex gap-2 w-full justify-end">
                                        <Button size="sm" onClick={() => handleApproveInvitation(item._id, item.roomId)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs cursor-pointer">
                                            <CircleCheckBig size={14} className="mr-1" /> Accept
                                        </Button>
                                        <Button size="sm" onClick={() => handleRejectInvitation(item._id)} variant="destructive" className="px-3 py-1 h-8 text-xs cursor-pointer">
                                            <CircleX size={14} className="mr-1" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <p className="text-center text-sm text-gray-500 py-6">No received requests or invitations</p>
                    )}
                </TabsContent>

                <TabsContent value="sent" className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {sendedData.length > 0 ? (
                        sendedData.map((item: RequestData) => (
                            <div key={item._id} className="flex flex-col items-start p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p className="text-sm text-gray-800 leading-snug">
                                    You requested <span className="font-semibold text-green-600">{item?.reciverId?.name || "User"}</span> to join room: <span className="font-bold text-green-700">{item.roomId}</span>
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-gray-500 py-6">No sent requests</p>
                    )}
                </TabsContent>
            </Tabs>
        </DropdownMenuContent>
    );

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#1f2125]">
                <p className="text-white text-lg">Redirecting...</p>
            </div>
        );
    }

    return (
        <nav className="text-white bg-primary px-5 py-4">

            {/* Top Navbar Row */}
            <div className="flex justify-between items-center">
                <Link href="/dashboard">
                    <div className="flex items-center cursor-pointer">
                        <Image src={Logo} alt="logo" className="w-[80px]" />
                        <p className="text-2xl font-semibold mt-2">
                            COD<span className="text-green-400 font-semibold">IE</span>
                        </p>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex gap-10">
                    <Link href="/dashboard" className={isActive("/dashboard") ? "text-green-400 font-bold" : ""}>Home</Link>
                    <Link href="/discover" className={isActive("/discover") ? "text-green-400 font-bold" : ""}>Discover</Link>
                    <Link href="/starred" className={isActive("/starred") ? "text-green-400 font-bold" : ""}>Starred</Link>
                    <Link href="/plan" className={isActive("/plan") ? "text-green-400 font-bold" : ""}>Plan</Link>
                </div>

                {/* Right Side Actions Container (Single Bell instance for both mobile & desktop) */}
                <div className="flex space-x-3 items-center text-black">
                    {/* Notification Bell */}
                    <DropdownMenu open={notificationOpen} onOpenChange={handleNotificationOpen}>
                        <DropdownMenuTrigger asChild>
                            <div className="relative flex items-center justify-center cursor-pointer p-1">
                                <Bell
                                    size={28}
                                    className={`text-white ${hasNewNotifications ? 'animate-pulse' : ''}`}
                                />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                                        {notificationCount}
                                    </span>
                                )}
                            </div>
                        </DropdownMenuTrigger>
                        {notificationMenuContent}
                    </DropdownMenu>

                    {/* Desktop Profile Button (Hidden on Mobile) */}
                    <div className="hidden md:block">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                {user && user.token ? (
                                    <Button variant="outline">
                                        {user.name}
                                        <Avatar className="ml-2">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>US</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                ) : (
                                    <Link href="/login">
                                        <Button variant="outline">
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

                    {/* Mobile Hamburger Menu Button (Hidden on Desktop) */}
                    <button
                        className="md:hidden cursor-pointer text-white p-1"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="flex flex-col space-y-4">
                    <Link href="/dashboard">Home</Link>
                    <Link href="/discover">Discover</Link>
                    <Link href="/plan">Plan</Link>
                    <Link href="/starred">Starred</Link>

                    {/* Profile Section */}
                    <div className="text-black">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                {user && user.token ? (
                                    <Button variant="outline" className="w-full">
                                        {user.name}
                                        <Avatar className="ml-2">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>US</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                ) : (
                                    <Link href="/login">
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
            </div>
        </nav>
    );
})

Navbar.displayName = "Navbar";
export default Navbar;