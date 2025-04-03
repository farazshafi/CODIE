"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "../../../../public/logo-light.png";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";

const Page = () => {
    const [otp, setOtp] = useState(""); // Set OTP state as an empty string

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt with:", { otp }); // Logs OTP to console
    };

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
                    <div className="flex items-center justify-center">
                        <Image src={Logo} alt="logo" width={80} height={80} />
                        <p className="text-2xl font-semibold mt-2">
                            COD<span className="mygreen font-semibold">IE</span>
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <p className="text-center mb-3">Enter your one-time password.</p>
                        <div className="flex justify-center">
                            <InputOTP 
                                value={otp} // Bind value to state
                                onChange={(value) => setOtp(value)} // Update state on change
                                maxLength={4}
                            >
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                            </InputOTP>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 inline">
                                Remain <span className="mygreen font-medium">30:00</span>
                            </p>
                        </div>
                        <Button type="submit" className="w-full py-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                            Verify OTP
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Page;
