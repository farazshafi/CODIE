"use client"
import React, { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';
import AnimatedInput from '@/components/ui/AnimatedInput';
import { Input } from '@/components/ui/input';

interface LoginErrors {
    email?: string;
    password?: string;
}

const AdminLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<LoginErrors>({});

    const validateForm = () => {
        const newErrors: LoginErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Simulating API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For demonstration only - would be replaced with actual authentication
            toast.success('Login successful!');
            console.log('Login attempt:', { email, password });

        } catch (error) {
            toast.error('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

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
                                        errors.email ? "text-destructive" : (email ? "text-green-500" : "")
                                    )} />
                                </div>
                                <Input
                                    id="email"
                                    placeholder='Email'
                                    type="email"
                                    className="pl-10 text-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute left-4 top-3.5 text-gray-500">
                                    <Lock size={20} className={cn(
                                        "transition-colors",
                                        errors.password ? "text-destructive" : (password ? "text-green-500" : "")
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