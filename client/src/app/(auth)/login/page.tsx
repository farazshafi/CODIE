"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Facebook } from "lucide-react";
import Image from "next/image";
import Logo from "../../../../public/logo-light.png";
import Link from "next/link";
import { useMutationHook } from "@/hooks/useMutationHook";
import { googleAuthLoginApi, loginUserApi } from "@/apis/userApi";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from 'next/navigation';
import { signInWithPopup } from "firebase/auth";
import { auth, gProvider } from "@/lib/firebaseSetup";
import PageTransitionWrapper from "@/components/TransitionWrapper";
import Loading from "@/components/Loading";
import { loginSchema } from "@/lib/validations/userSchema";


const Page = () => {
    const router = useRouter()
    const setUser = useUserStore((state) => state.setUser)
    const user = useUserStore((state) => state.user)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [isPasswordHidden, setIsPasswordHidden] = useState(true)


    const { mutate, isLoading, isSuccess } = useMutationHook(loginUserApi, {
        onSuccess: (data) => {
            toast.success(data.message || "User Registred succesfully");
            setUser({
                name: data.data.name,
                email: data.data.email,
                avatar: data.data.avatar,
                token: data.accessToken,
                id: data.data.id
            })
            router.push("/dashboard")
        },

        onError: (e) => {
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

    const { mutate: googleMutate, isLoading: googleLoading } = useMutationHook(googleAuthLoginApi, {
        onSuccess: (data) => {
            toast.success(data.message || "Google Auth login Success")
            setUser({
                email: data.data.email,
                name: data.data.name,
                token: data.accessToken,
                avatar: data.data.avatar,
                id: data.data.id

            })
            router.push("/dashboard")
        },
        onError: (e) => {
            console.log("Error:", e?.response?.data);
            const message =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Something went wrong";
            toast.error(message);
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
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


    const handlePassHidden = () => {
        setIsPasswordHidden(prev => !prev)
    }

    const handleGoogleSignIn = async () => {
        try {
            const { user } = await signInWithPopup(auth, gProvider)
            const { email } = user

            googleMutate({ email })
        } catch (err) {
            console.log("Google Sign In Error: ", err)
        }
    }


    useEffect(() => {
        if (user && user.token) {
            router.push("/dashboard")
        } else {
            setCheckingAuth(false)
        }
    }, [user])


    if (checkingAuth) {
        return (
            <Loading />
        );
    }

    if (isLoading || googleLoading) {
        return (
            <Loading fullScreen />
        );
    }

    return (
        <div style={{ background: 'linear-gradient(to left bottom, #363940, #000000)' }} className="h-screen w-full px-6 sm:px-10 md:px-20 lg:px-32 py-10 flex items-center justify-center">
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between gap-10">
                {/* Left Section */}
                <div className="text-white md:text-left flex flex-col justify-between md:items-start">
                    <h2 className="text-xl sm:text-3xl">Welcome Back, <br />
                        <span className="mygreen font-semibold">Let's Code!</span></h2>
                    <h1 className="text-4xl sm:text-5xl font-bold mt-6 leading-tight">
                        Join the Future<br />
                        of Coding Together.
                    </h1>
                </div>

                {/* Right Section*/}
                <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md shadow-md">
                    {/* Logo */}
                    <div className="flex items-center justify-center">
                        <Image src={Logo} alt="logo" width={80} height={80} />
                        <p className="text-2xl font-semibold mt-2">
                            COD<span className="mygreen font-semibold">IE</span>
                        </p>
                    </div>

                    {/* Social Login */}
                    <div className="mt-6">
                        <p className="text-center text-gray-600 mb-4">Other signin options</p>
                        <div className="w-full">
                            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5">
                                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                </svg>
                                Google
                            </Button>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="py-4 border-b border-gray-300"
                        />
                        <div className="flex flex-row gap-x-3 items-center">
                            <Input
                                type={isPasswordHidden ? "password" : "text"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="py-4 border-b border-gray-300"
                            />
                            {isPasswordHidden ? (
                                <div onClick={handlePassHidden} className="bg-black p-2 text-white rounded-md">
                                    <Eye />
                                </div>
                            ) : (
                                <div onClick={handlePassHidden} className="bg-black p-2 text-white rounded-md">
                                    <EyeOff />
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 inline hover:underline">
                                <Link href={"/reset"}>
                                    Forgot password? <span className="mygreen font-medium">reset</span>
                                </Link>
                            </p>
                        </div>
                        <Button disabled={isLoading} type="submit" className="w-full py-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                            Login
                        </Button>
                    </form>

                    {/* Signup Link */}
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account?
                        <Link href={"/register"}>
                            <p className="mygreen inline ml-2 font-medium hover:underline">
                                Sign up
                            </p>
                        </Link>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Page;
