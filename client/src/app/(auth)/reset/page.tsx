"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook } from "lucide-react";
import Image from "next/image";
import Logo from "../../../../public/logo-light.png";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

const Page = () => {
    const [confirmPassword, setConfirmPassword] = useState("")
    const [password, setPassword] = useState("");
    const [isRemembered, setIsRemembered] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt with:", { confirmPassword, password, isRemembered });
        // Handle login logic here
    };

    return (
        <div className="h-screen w-full bg-[#1f2125] px-6 sm:px-10 md:px-20 lg:px-32 py-10 flex items-center justify-center">
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between gap-10">
                {/* Left Section */}
                <div className="text-white md:text-left flex flex-col justify-center md:items-start">
                    <h1 className="text-4xl sm:text-5xl font-bold mt-6 leading-tight">
                        Reset password! <br />
                        Within a <span className="mygreen font-semibold">Sec</span>.
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

                    {/* Reset Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <Input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="py-4 border-b border-gray-300"
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="py-4 border-b border-gray-300"
                            required
                        />
                        
                        <div className="flex items-center">
                            <Checkbox
                                id="isRemembered"
                                checked={isRemembered}
                                onCheckedChange={() => setIsRemembered((prev) => !prev)}
                            />
                            <label htmlFor="isRemembered" className="ml-3 text-sm text-gray-600">
                                Remember the password
                            </label>
                        </div>
                        
                        <Button type="submit" className="w-full py-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                            Create new Password
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Page;
