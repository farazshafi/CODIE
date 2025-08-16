"use client"
import React, { useState } from 'react';
import { LayoutGrid, Users, Banknote, HandCoins, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from "../../../../../public/logo.png"
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import Loading from '@/components/Loading';
import { useMutationHook } from '@/hooks/useMutationHook';
import { logoutAdminApi } from '@/apis/adminApi';

const AdminSidebar = () => {
    const currentPath = usePathname()
    const router = useRouter()

    const { mutate: logoutAdmin } = useMutationHook(logoutAdminApi, {
        onSuccess() {
            logout();
            router.push("/admin/login");
        }
    })

    const logout = useUserStore((state) => state.logout)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = () => {
        setIsLoading(true);
        logoutAdmin()
        setIsLoading(false)
    }

    return (
        <div className="admin-sidebar w-16 md:w-64 flex flex-col h-screen fixed left-0">
            <div className="flex items-center p-4 mb-6">
                <Link href="/dashboard">
                    <div className="flex items-center cursor-pointer">
                        <Image src={Logo} alt="logo" className="w-[80px]" />
                        <p className="text-2xl text-white font-semibold mt-2">
                            COD<span className="text-green-400 font-semibold">IE</span>
                        </p>
                    </div>
                </Link>
            </div>

            <div className="flex flex-col flex-1 space-y-2 px-2">
                <Link
                    href="/admin/dashboard"
                    className={`p-3 rounded-md transition-colors hover:scale-105 transform duration-200 flex items-center 
    ${currentPath === '/admin/dashboard' ? 'bg-admin-selected' : 'text-admin-muted hover:bg-admin-card hover:text-white'}`}
                >
                    <LayoutGrid className={`h-5 w-5 ${currentPath === '/admin/dashboard' ? 'text-admin-accent' : 'text-admin-muted'}`} />
                    <span className="ml-3 hidden md:inline">Dashboard</span>
                </Link>

                <Link
                    href="/admin/users"
                    className={`p-3 rounded-md transition-colors hover:scale-105 transform duration-200 flex items-center 
    ${currentPath === '/admin/users' ? 'bg-admin-selected' : 'text-admin-muted hover:bg-admin-card hover:text-white'}`}
                >
                    <Users className={`h-5 w-5 ${currentPath === '/admin/users' ? 'text-admin-accent' : 'text-admin-muted'}`} />
                    <span className="ml-3 hidden md:inline">Users</span>
                </Link>

                <Link
                    href="/admin/subscription"
                    className={`p-3 rounded-md transition-colors hover:scale-105 transform duration-200 flex items-center 
    ${currentPath === '/admin/subscription' ? 'bg-admin-selected' : 'text-admin-muted hover:bg-admin-card hover:text-white'}`}
                >
                    <Banknote className={`h-5 w-5 ${currentPath === '/admin/subscription' ? 'text-admin-accent' : 'text-admin-muted'}`} />
                    <span className="ml-3 hidden md:inline">Subscription</span>
                </Link>

                <Link
                    href="/admin/payment"
                    className={`p-3 rounded-md transition-colors hover:scale-105 transform duration-200 flex items-center 
    ${currentPath === '/admin/payment' ? 'bg-admin-selected' : 'text-admin-muted hover:bg-admin-card hover:text-white'}`}
                >
                    <HandCoins className={`h-5 w-5 ${currentPath === '/admin/payment' ? 'text-admin-accent' : 'text-admin-muted'}`} />
                    <span className="ml-3 hidden md:inline">Payment</span>
                </Link>

            </div>


            <div className="p-4 border-t border-gray-700">
                {/* <Link href="/admin/settings" className="p-3 rounded-md hover:bg-admin-card transition-colors hover:scale-105 transform duration-200 flex items-center">
                    <Settings className="h-5 w-5 text-admin-muted" />
                    <span className="ml-3 hidden md:inline text-admin-muted">Settings</span>
                </Link> */}

                <Button onClick={handleLogout} className="p-3 rounded-md hover:bg-admin-card transition-colors hover:scale-105 transform duration-200 flex items-center mt-4 cursor-pointer">
                    <LogOut className="h-5 w-5 text-admin-muted" />
                    <span className="ml-3 hidden md:inline text-admin-muted">Logout</span>
                </Button>
            </div>

            {isLoading && <Loading />}
        </div>
    );
};

export default AdminSidebar;