"use client"
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { loginSchema } from '@/lib/validations/userSchema';
import { useMutationHook } from '@/hooks/useMutationHook';
import { loginAdminApi } from '@/apis/adminApi';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

interface ApiError extends Error {
    response?: {
        data?: {
            errors?: { message: string }[];
            message?: string;
        };
    };
}

const AdminLogin = () => {
    const router = useRouter()
    const user = useUserStore((state) => state.user)
    const setUser = useUserStore((state) => state.setUser)

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');



    const { mutate, isLoading } = useMutationHook(loginAdminApi, {
        onSuccess: (data) => {
            toast.success(data.message || "User Registred succesfully");
            setUser({
                name: data.data.name,
                email: data.data.email,
                avatar: data.data.avatar,
                token: data.data.accessToken,
                id: data.data.id,
                isAdmin: data.data.isAdmin,
            })
            router.push("/admin/dashboard")
        },

        onError: (e: ApiError) => {
            const errors = e?.response?.data?.errors;
            let message = "Login failed";
            if (Array.isArray(errors)) {
                message = errors.map(err => err.message).join("\n");
            } else if (e?.response?.data?.message) {
                message = e.response.data.message;
            }

            toast.error(message);
        }
    })



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = loginSchema.safeParse({
            email,
            password
        });

        if (!result.success) {
            result.error.errors.forEach(err => {
                toast.error(err.message);
            });
            return;
        }

        mutate({ email, password });

    };

    useEffect(() => {
        if (user && user.isAdmin) {
            router.push("/admin/dashboard")
            return
        }
    }, [user, router])

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="relative z-10 bg-black rounded-xl p-8 border border-green-500/50 ring-2 ring-green-500/70 ring-opacity-40 shadow-[0_0_10px_2px_rgba(34,197,94,0.5)] animate-[glow_2s_ease-in-out_infinite]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-green-500/10 via-transparent to-transparent rounded-xl -z-10 animate-pulse-glow"></div>
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <div className="h-12 w-12 rounded-full bg-green flex items-center justify-center shadow-lg mb-4">
                                <Lock size={24} className="text-black" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Login</h1>
                        <p className="text-gray-500 text-sm">
                            Enter your credentials to access the admin panel
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative flex items-center">
                                <div className="absolute left-4 top-3.5 text-gray-500">
                                    <Mail size={20} className={cn(
                                        "transition-colors",
                                        (email ? "text-green-500" : "")
                                    )} />
                                </div>
                                <Input
                                    id="email"
                                    placeholder='Email'
                                    className="pl-10 text-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute left-4 top-3.5 text-gray-500">
                                    <Lock size={20} className={cn(
                                        "transition-colors",
                                        (password ? "text-green-500" : "")
                                    )} />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 text-white"
                                    placeholder='Password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-green hover:bg-green-700 text-black font-medium py-3 h-auto text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="h-5 w-5 border-2 border-t-transparent border-black rounded-full animate-spin mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;