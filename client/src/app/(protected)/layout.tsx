'use client';

import Loading from '@/components/Loading';
import { SocketProvider } from '@/context/SocketContext';
import { useLivemessage } from '@/hooks/useLiveMessage';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const user = useUserStore((state) => state.user)
    const router = useRouter()

    useEffect(() => {
        if (!user) {
            router.push("/login")
        }
    }, [user, router])

    if (!user) {
        return <Loading fullScreen text='Redirecting to login page...' />
    }

    return (
        <SocketProvider userId={user?.id}>
            <ToastWrapper />
            {children}
            <Toaster richColors />
        </SocketProvider>
    );
}

const ToastWrapper = () => {
    useLivemessage()

    return (
        <>
        </>
    )
}