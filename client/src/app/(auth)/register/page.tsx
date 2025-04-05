"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Logo from "../../../../public/logo-light.png";
import Link from "next/link";
import { registerUserApi } from "@/apis/userApi";
import { useMutationHook } from "@/hooks/useMutationHook";
import { Facebook } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useUserStore } from "@/stores/userStore";

const Page = () => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const [email, setEmail] = useState("farazpachu777@gmail.com");
  const [password, setPassword] = useState("Farazpachu@123");
  const [username, setUsername] = useState("faraz shafi");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { mutate, isLoading, isError, error } = useMutationHook(registerUserApi, {
    onSuccess: (data) => {
      toast.success(data.message || "User Registred succesfully");

      setUser({
        email: data.data.email,
        name: data.data.name,
        token: data.accessToken
      });

      router.push("/");
    },
    
    onError: (e) => {
      console.log("registration error: ", e);
      const errors = e?.response?.data?.errors;
      let message = "Registration failed";
      if (Array.isArray(errors)) {
        message = errors.map(err => err.message).join("\n");
      } else if (e?.response?.data?.message) {
        message = e.response.data.message;
      }

      toast.error(message);
    }

  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, name: username, password });
  };

  useEffect(() => {
    if (user && user.token) {
      router.push("/");
    } else {
      setCheckingAuth(false);
    }
  }, [user]);

  if (checkingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#1f2125]">
        <p className="text-white text-lg">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#1f2125] px-6 sm:px-10 md:px-20 lg:px-32 py-10 flex items-center justify-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between gap-10">
        {/* Left Section */}
        <div className="text-white md:text-left flex flex-col justify-between md:items-start">
          <h2 className="text-2xl text-left sm:text-3xl">
            Create Your Account &<br />
            Start Coding Together!"
          </h2>
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
            <p className="text-center text-gray-600 mb-4">
              Other signup options
            </p>
            <div className="flex flex-col justify-between sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                className="flex w-full sm:w-40 items-center justify-center gap-2 py-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                  className="h-5 w-5"
                >
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="flex w-full sm:w-40 items-center justify-center gap-2 py-4"
              >
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
            <Button
              type="submit"
              className="w-full py-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              {isLoading ? <p>Loading...</p> : <p>Register</p>}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?
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
