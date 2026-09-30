"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    MonitorX,
    LayoutDashboard,
    Compass,
    User,
    Code2,
    Sparkles,
    Terminal,
    Users,
    Volume2,
    ArrowRight
} from "lucide-react";
import Logo from "../../../../../public/logo.png";
import { Button } from "@/components/ui/button";

export default function MobileEditorBlocker() {
    return (
        <div className="min-h-screen w-full bg-[#0b0c10] text-white flex flex-col justify-between p-5 relative overflow-hidden font-sans">
            {/* Background Decorative Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header / Logo */}
            <div className="flex items-center justify-between z-10 py-2 border-b border-white/5">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image src={Logo} alt="CODIE Logo" className="w-8 h-8" />
                    <span className="text-xl font-bold tracking-tight">
                        COD<span className="text-green-400">IE</span>
                    </span>
                </Link>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                    <MonitorX className="w-3.5 h-3.5" />
                    Desktop Only
                </span>
            </div>

            {/* Main Content */}
            <div className="my-auto py-8 flex flex-col items-center text-center z-10 max-w-md mx-auto">
                {/* Visual Icon Badge */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tertiary via-[#1e1e2e] to-black border border-white/10 flex items-center justify-center shadow-2xl">
                        <MonitorX className="w-10 h-10 text-green-400" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-black p-1.5 rounded-lg shadow-lg">
                        <Sparkles className="w-4 h-4 fill-black" />
                    </div>
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                    Editor is Best Experienced on Desktop
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    The CODIE IDE packs desktop-class capabilities that require larger screen space and keyboard controls to give you full development power.
                </p>

                {/* Feature Highlights Grid */}
                <div className="w-full bg-[#13141c] border border-white/10 rounded-2xl p-4 text-left mb-6 space-y-3 shadow-inner">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Why use Desktop for Editor?
                    </p>

                    <div className="flex items-start gap-3 text-xs text-gray-300">
                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-400 mt-0.5">
                            <Code2 className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-semibold text-white">Split Code & Console:</span> Multi-pane workspace for simultaneous editing and debugging.
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs text-gray-300">
                        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 mt-0.5">
                            <Terminal className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-semibold text-white">Live Code Execution:</span> Real-time execution output with customized run parameters.
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs text-gray-300">
                        <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 mt-0.5">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-semibold text-white">Real-time Collaboration:</span> Live cursor tracking, multi-user edits, and integrated audio rooms.
                        </div>
                    </div>
                </div>

                {/* Mobile Accessible Navigation Buttons */}
                <div className="w-full flex flex-col gap-3">
                    <p className="text-xs text-gray-400">
                        You can still access full features on mobile:
                    </p>

                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-11 rounded-xl shadow-lg shadow-green-500/10 flex items-center justify-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Go to Dashboard
                            <ArrowRight className="w-4 h-4 ml-auto" />
                        </Button>
                    </Link>

                    <Link href="/discover" className="w-full">
                        <Button variant="outline" className="w-full bg-[#181924] border-white/10 hover:bg-white/10 text-white font-medium h-11 rounded-xl flex items-center justify-center gap-2">
                            <Compass className="w-4 h-4 text-blue-400" />
                            Explore Discovery
                            <ArrowRight className="w-4 h-4 ml-auto opacity-60" />
                        </Button>
                    </Link>

                    <Link href="/profile" className="w-full">
                        <Button variant="ghost" className="w-full text-gray-400 hover:text-white hover:bg-white/5 h-10 rounded-xl flex items-center justify-center gap-2">
                            <User className="w-4 h-4" />
                            My Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Footer note */}
            <div className="z-10 text-center py-2 border-t border-white/5">
                <p className="text-[11px] text-gray-500">
                    CODIE Platform • Switch to Desktop or Tablet to write & compile code.
                </p>
            </div>
        </div>
    );
}
