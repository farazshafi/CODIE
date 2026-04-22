'use client';

import { getUserSubscriptionApi } from '@/apis/userSubscriptionApi';
import Loading from '@/components/Loading';
import { SocketProvider } from '@/context/SocketContext';
import { useLivemessage } from '@/hooks/useLiveMessage';
import { useMutationHook } from '@/hooks/useMutationHook';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const user = useUserStore((state) => state.user)
    const setSubscription = useUserStore((state) => state.setSubscription)
    const router = useRouter()

    const { mutate: getUserSubscriptions } = useMutationHook(getUserSubscriptionApi, {
        onSuccess(data) {
            console.log("User subscription data", data.data)
            setSubscription(data.data)
        }
    })

    useEffect(() => {
        if (!user) {
            router.push("/login")
            return
        }
        getUserSubscriptions(user?.id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

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