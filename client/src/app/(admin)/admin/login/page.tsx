import BackgroundGrid from '@/components/ui/BackgroundGrid'
import React from 'react'
import AdminLogin from '../_components/AdminLogin'
import Link from 'next/link'
import Image from 'next/image'
import Logo from "../../../../../public/logo.png"

const page = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            <BackgroundGrid />

            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
                <div className="mb-12 flex items-center justify-center">
                    <Link href="/admin_dashboard">
                        <div className="flex items-center cursor-pointer">
                            <Image src={Logo} alt="logo" className="w-[80px]" />
                            <p className="text-2xl text-white font-semibold mt-2">
                                COD<span className="text-green-400 font-semibold">IE</span>
                            </p>
                        </div>
                    </Link>
                </div>

                <AdminLogin />

                <div className="mt-16 text-sm text-white/40 text-center">
                    <p>© 2025 Code Collab. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default page