"use client"
import React, { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {

    const user = useUserStore((state) => state.user)
    const router = useRouter()
    const logout = useUserStore((state) => state.logout)

    useEffect(() => {
        if (!user) {
            router.push("/admin/login")
            return
        }

        if (user && !user.isAdmin) {
            logout()
            toast.warning("You are not allowed")
            return
        }
    }, [])


    return (
        <div className="admin-layout flex min-h-screen bg-gray-900 text-white">
            <AdminSidebar />

            <div className="flex-1 pl-16 md:pl-64 w-full">
                <header className="p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl md:text-2xl font-bold truncate">{title}</h1>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <div className="hidden sm:block">
                                <p className="text-sm text-admin-muted">Good day, {user?.name}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                <span className="text-sm font-medium">A</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;