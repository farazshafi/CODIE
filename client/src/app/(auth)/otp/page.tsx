"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "../../../../public/logo-light.png";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { useMutationHook } from "@/hooks/useMutationHook";
import { resendOtpApi, verifyOtpApi } from "@/apis/userApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import Loading from "@/components/Loading";

const Page = () => {
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);
    const user = useUserStore((state) => state.user);

    const email = JSON.parse(localStorage.getItem("tempMail") || "null");

    const {
        mutate: verifyOtp,
        isLoading: verifyingOtp,
    } = useMutationHook(verifyOtpApi, {
        onSuccess: (data) => {
            toast.success(data.message || "OTP verified successfully");
            setUser({
                name: data.data.name,
                email: data.data.email,
                token: data.accessToken,
                id: data.data.id
            });
            router.push("/dashboard");
            localStorage.removeItem("tempMail");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Error verifying OTP");
        },
    });

    const {
        mutate: resendOtp,
        isLoading: resendLoading,
    } = useMutationHook(resendOtpApi, {
        onSuccess: (data) => {
            toast.success(data.message || "OTP resent successfully");
            setTimeLeft(60);
            setIsResendDisabled(true);
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Error resending OTP");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            return;
        }
        verifyOtp({ email, otp });
    };

    const handleResendOtp = () => {
        if (!email) {
            return;
        }
        resendOtp({ email });
    };

    useEffect(() => {
        if (!email) {
            setIsRedirecting(true);
            router.push("/register");
            return;
        }

        if (user && user.token) {
            setIsRedirecting(true);
            router.push("/dashboard");
        }
    }, [user]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsResendDisabled(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    if (isRedirecting || verifyingOtp) {
        return (
            <div className="h-screen w-full bg-[#1f2125] flex items-center justify-center">
                <p className="text-white text-lg">
                    {verifyingOtp ? <Loading text="Verifying otp" /> : <Loading text="Redirecting..." />}
                </p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#1f2125] px-6 sm:px-10 md:px-20 lg:px-32 py-10 flex items-center justify-center">
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between gap-10">
                {/* Left Section */}
                <div className="text-white md:text-left flex flex-col justify-center md:items-start">
                    <h1 className="text-4xl sm:text-5xl font-bold mt-6 leading-tight">
                        Almost There! <br />
                        Just One More <br />
                        <span className="mygreen">Step.</span>
                    </h1>
                </div>

                {/* Right Section */}
                <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md shadow-md">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2">
                        <Image src={Logo} alt="logo" width={50} height={50} />
                        <p className="text-2xl font-semibold">
                            COD<span className="mygreen">IE</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <p className="text-center mb-3">Enter your one-time password.</p>
                        <div className="flex justify-center gap-3">
                            <InputOTP
                                value={otp}
                                onChange={setOtp}
                                maxLength={6}
                                className="flex space-x-3"
                            >
                                {[...Array(6)].map((_, i) => (
                                    <InputOTPSlot
                                        key={i}
                                        index={i}
                                        className="w-12 h-12 text-center border border-green-500 rounded-md"
                                    />
                                ))}
                            </InputOTP>
                        </div>

                        <div className="text-right">
                            {isResendDisabled ? (
                                <p className="text-sm text-gray-600 inline">
                                    Resend in{" "}
                                    <span className="mygreen font-medium">
                                        {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                                        {String(timeLeft % 60).padStart(2, "0")}
                                    </span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendLoading}
                                    className="text-sm text-green-600 font-medium hover:underline"
                                >
                                    {resendLoading ? "Resending..." : "Resend OTP"}
                                </button>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={verifyingOtp || otp.length < 6}
                            className="w-full py-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                        >
                            Verify OTP
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Page;
