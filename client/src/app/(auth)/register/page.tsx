"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook } from "lucide-react";
import Image from "next/image";
import Logo from "../../../../public/logo-light.png";
import Link from "next/link";

const Page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Register attempt with:", { username, email, password });
        // Handle login logic here
    };

    return (
        <div className="h-screen w-full bg-[#1f2125] px-6 sm:px-10 md:px-20 lg:px-32 py-10 flex items-center justify-center">
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between gap-10">
                {/* Left Section */}
                <div className="text-white md:text-left flex flex-col justify-between md:items-start">
                    <h2 className="text-2xl text-left sm:text-3xl">Create Your Account &<br />
                        Start Coding Together!"</h2>
                    <h1 className="text-4xl sm:text-5xl font-bold mt-6 leading-tight">
                        Real-Time <br />
                        Coding, Real <br />
                        Time Innovation.
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
                        <p className="text-center text-gray-600 mb-4">Other signup options</p>
                        <div className="flex flex-col justify-between sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                            <Button variant="outline" className="flex w-full sm:w-40 items-center justify-center gap-2 py-4">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5">
                                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                </svg>
                                Google
                            </Button>
                            <Button variant="outline" className="flex w-full sm:w-40 items-center justify-center gap-2 py-4">
                                <Facebook className="h-5 w-5" />
                                Facebook
                            </Button>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="py-4 border-b border-gray-300"
                            required
                        />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="py-4 border-b border-gray-300"
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="py-4 border-b border-gray-300"
                            required
                        />
                        <Button type="submit" className="w-full py-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                            Register
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        Alredy have Account ?
                        <Link href={"/login"}>
                            <p className="mygreen inline ml-2 font-medium hover:underline">
                                Sign in
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;