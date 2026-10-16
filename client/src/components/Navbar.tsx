"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

// Anchor links scroll within the landing page; About/Docs navigate to pages.
const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Solutions", href: "/#solutions" },
    { label: "Pricing", href: "/#pricing" },
    { label: "About", href: "/about" },
    { label: "Docs", href: "/docs" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    // Deepen background on scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                        ? "bg-[#0d0f12]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40"
                        : "bg-[#0d0f12]/80 backdrop-blur-sm border-b border-white/5"
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 h-16 flex items-center justify-between gap-8">

                    {/* ── Logo ── */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="CODIE Home">
                        <Image
                            src="/logo.png"
                            alt="CODIE"
                            width={36}
                            height={36}
                            className="object-contain"
                            priority
                        />
                        <span className="text-white font-bold text-xl tracking-wide group-hover:text-[#1bf07c] transition-colors duration-200">
                            CODIE
                        </span>
                    </Link>

                    {/* ── Desktop Nav Links ── */}
                    <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={label}
                                href={href}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-[#1bf07c] transition-colors duration-200 rounded-lg hover:bg-white/5"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* ── Desktop Auth ── */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold bg-[#1bf07c] text-black hover:bg-[#0fd868] active:bg-[#00c855] transition-all duration-200 shadow-md shadow-[#1bf07c]/20 hover:shadow-[#1bf07c]/40"
                        >
                            Get Started Free
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* ── Mobile Hamburger ── */}
                    <button
                        onClick={() => setMobileOpen((p) => !p)}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>

                {/* ── Mobile Drawer ── */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-white/10 bg-[#0d0f12]/98 backdrop-blur-md animate-mobile-drawer">
                        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
                            {navLinks.map(({ label, href }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-[#1bf07c] hover:bg-white/5 rounded-lg transition-colors duration-200"
                                >
                                    {label}
                                </Link>
                            ))}

                            <div className="h-px bg-white/10 my-2" />

                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center gap-2 mx-2 py-3 rounded-full text-sm font-semibold bg-[#1bf07c] text-black hover:bg-[#0fd868] transition-all duration-200"
                            >
                                Get Started Free <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Spacer so page content starts below the fixed navbar */}
            <div className="h-16" aria-hidden="true" />
        </>
    );
}
