"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Logo from "../../../../public/logo-light.png";
import Link from "next/link";
import { useMutationHook } from "@/hooks/useMutationHook";
import { getResetLinkApi, googleAuthLoginApi, loginUserApi } from "@/apis/userApi";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from 'next/navigation';
import { signInWithPopup } from "firebase/auth";
import { auth, gProvider } from "@/lib/firebaseSetup";
import Loading from "@/components/Loading";
import { loginSchema } from "@/lib/validations/userSchema";
import { getUserSubscriptionApi } from "@/apis/userSubscriptionApi";


interface ApiError extends Error {
    response?: {
        data?: {
            errors?: { message: string }[];
            message?: string;
            error?: string;
        };
    };
}

const Page = () => {
    const router = useRouter()
    const setUser = useUserStore((state) => state.setUser)
    const setSubscription = useUserStore((state) => state.setSubscription)
    const user = useUserStore((state) => state.user)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [isPasswordHidden, setIsPasswordHidden] = useState(true)
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    const { mutate: getSubscription } = useMutationHook(getUserSubscriptionApi, {
        onSuccess(response) {
            setSubscription(response.data)
        }
    })

    const { mutate, isLoading } = useMutationHook(loginUserApi, {
        onSuccess: (data) => {
            if (data === undefined) return
            toast.success(data.message || "User Registred succesfully");
            setUser({
                name: data.data.name,
                email: data.data.email,
                avatar: data.data.avatar,
                token: data.data.accessToken,
                id: data.data.id,
                isAdmin: data.data.isAdmin,
                github: data.data.github,
                portfolio: data.data.portfolio
            })
            getSubscription(data.data.id)
            router.push("/dashboard")
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

    const { mutate: googleMutate, isLoading: googleLoading } = useMutationHook(googleAuthLoginApi, {
        onSuccess: (data) => {
            if (data === undefined) return
            toast.success(data.message || "Google Auth login Success")
            setUser({
                email: data.data.email,
                name: data.data.name,
                token: data.data.accessToken,
                avatar: data.data.avatar,
                id: data.data.id,
                isAdmin: data.data.isAdmin,
                github: data.data.github,
                portfolio: data.data.portfolio
            })
            getSubscription(data.data.id)
            router.push("/dashboard")
        },
        onError: (e: ApiError) => {
            console.log("Error:", e?.response?.data);
            const message =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Something went wrong";
            toast.error(message);
        }
    })

    const { mutate: getResetLink } = useMutationHook(getResetLinkApi, {
        onError(error: ApiError) {
            toast.error(error?.response?.data?.message || "Error while getting reset link")
            return
        },
        onSuccess(data) {
            toast.success(data.message || "Reset link sent successfully")
            return
        },
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

    const handlePasswordReset = () => {
        const result = loginSchema.shape.email.safeParse(resetEmail);

        if (!result.success) {
            toast.error("Enter valid email")
            return;
        }

        getResetLink({ email: resetEmail })
        setShowResetModal(false);
    }

    const handlePassHidden = () => {
        setIsPasswordHidden(prev => !prev)
    }

    const handleGoogleSignIn = async () => {
        try {
            const { user } = await signInWithPopup(auth, gProvider)
            const { email } = user

            if (email) {
                googleMutate({ email })
            }
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <>
            <div style={{ background: 'linear-gradient(to left bottom, #363940, #000000)' }} className="h-screen w-full px-6 sm:px-10 md:px-20 lg:px-32 py-10 flex items-center justify-center">
                <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between gap-10">
                    {/* Left Section */}
                    <div className="text-white md:text-left flex flex-col justify-between md:items-start">
                        <h2 className="text-xl sm:text-3xl">Welcome Back, <br />
                            <span className="mygreen font-semibold">Let&apos;s Code!</span></h2>
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
                                    <button
                                        type="button"
                                        onClick={() => setShowResetModal(true)}
                                        className="text-sm text-gray-600 inline hover:underline"
                                    >
                                        Forgot password? <span className="mygreen font-medium">reset</span>
                                    </button>
                                </p>
                            </div>
                            <Button disabled={isLoading} type="submit" className="w-full py-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                                Login
                            </Button>
                        </form>

                        {/* Signup Link */}
                        <div className="mt-4 text-center text-sm text-gray-600">
                            Don&apos;t have an account?
                            <Link href={"/register"}>
                                <p className="mygreen inline ml-2 font-medium hover:underline">
                                    Sign up
                                </p>
                            </Link>
                        </div>
                    </div>
                </div >
            </div >
            {showResetModal && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                        />
                        <div className="flex justify-end mt-4 gap-2">
                            <Button variant="outline" onClick={() => setShowResetModal(false)}>
                                Cancel
                            </Button>
                            <Button disabled={resetEmail.length < 1} onClick={handlePasswordReset}>
                                Send OTP
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </>


    );
};

export default Page;
