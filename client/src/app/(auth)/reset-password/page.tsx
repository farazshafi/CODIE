"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Logo from "../../../../public/logo-light.png";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutationHook } from "@/hooks/useMutationHook";
import { setNewPasswordApi } from "@/apis/userApi";
import { toast } from "sonner";
import { setNewPasswordSchema } from "@/lib/validations/userSchema";
import { EyeIcon, EyeOff } from "lucide-react";

const Page = () => {
    const [confirmPassword, setConfirmPassword] = useState("")
    const [password, setPassword] = useState("");
    const [isRemembered, setIsRemembered] = useState(false)
    const [hidePassword, setHidePassword] = useState(true)

    const searchParams = useSearchParams()
    const router = useRouter()

    const token = searchParams.get("token")
    const email = searchParams.get("email")

    const { mutate: setNewPassword } = useMutationHook(setNewPasswordApi, {
        onSuccess(data) {
            toast.success(data.message || "Password reset successfully!")
            router.push("/login")
        },
        onError(error) {
            console.log(error)
            toast.error(error.response.data.message || "Error while updating Password! try again")
            router.push("/login")
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt with:", { confirmPassword, password });

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        const result = setNewPasswordSchema.safeParse({
            email,
            token: token,
            password
        });

        console.log("result ", result)

        if (!result.success) {
            result.error.errors.forEach(err => {
                toast.error(err.message);
            });
            return;
        }


        setNewPassword({ email: email, password: password, token: token })
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
                        <div className="flex gap-3 flex-row items-center">
                            <Input
                                type={hidePassword ? "password" : 'text'}
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="py-4 border-b border-gray-300"
                                required
                            />
                            <div onClick={() => setHidePassword((prev) => !prev)} className="bg-black rounded-md p-2 text-white hover:bg-gray-800">
                                {hidePassword ? <EyeIcon /> : <EyeOff />}
                            </div>
                        </div>
                        <div className="flex">

                            <Input
                                type={hidePassword ? "password" : 'text'}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="py-4 border-b border-gray-300"
                                required
                            />
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
