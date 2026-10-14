"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Github, Twitter, Linkedin, Youtube } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const links = {
    Product: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Docs", href: "/docs" },
        { label: "Changelog", href: "#" },
    ],
    Company: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "/contact" },
    ],
    Legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookie-policy" },
    ],
};

const socials = [
    { label: "GitHub", href: "#", icon: Github },
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "LinkedIn", href: "#", icon: Linkedin },
    { label: "YouTube", href: "#", icon: Youtube },
];

// ─── Footer ───────────────────────────────────────────────────────────────────
export default function Footer() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubmitted(true);
        setEmail("");
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <footer className="bg-[#0a0c0f] border-t border-white/10">
            {/* ── Main Grid ── */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">

                {/* Brand — spans 2 on lg */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Link href="/" className="inline-flex items-center gap-2.5 group w-fit">
                        <Image
                            src="/logo.png"
                            alt="CODIE"
                            width={36}
                            height={36}
                            className="object-contain"
                        />
                        <span className="text-white font-bold text-xl tracking-wide group-hover:text-[#1bf07c] transition-colors duration-200">
                            CODIE
                        </span>
                    </Link>

                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                        A collaborative code editor and live teaching platform for modern developers and educators.
                    </p>

                    <div className="flex items-center gap-3">
                        {socials.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={label}
                                href={href}
                                aria-label={label}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#1bf07c] hover:bg-white/5 border border-white/8 hover:border-[#1bf07c]/30 transition-all duration-200"
                            >
                                <Icon className="w-4 h-4" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Link columns */}
                {Object.entries(links).map(([section, items]) => (
                    <div key={section} className="flex flex-col gap-4">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-white">{section}</h3>
                        <ul className="flex flex-col gap-3">
                            {items.map(({ label, href }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        className="text-sm text-gray-500 hover:text-[#1bf07c] transition-colors duration-200"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* ── Newsletter ── */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-1">Stay Updated</h3>
                        <p className="text-xs text-gray-500">Get the latest features and updates.</p>
                    </div>
                    <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            aria-label="Email address"
                            className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#1bf07c]/50 transition-all duration-200"
                        />
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1bf07c] text-black text-sm font-semibold hover:bg-[#0fd868] active:bg-[#00c855] transition-all duration-200 shrink-0 shadow-md shadow-[#1bf07c]/20"
                        >
                            {submitted ? "Subscribed!" : <><span>Subscribe</span><ArrowRight className="w-3.5 h-3.5" /></>}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-600">© {new Date().getFullYear()} CODIE. All rights reserved.</p>
                    <p className="text-xs text-gray-600">
                        Builded for developers and educators.
                    </p>
                </div>
            </div>
        </footer>
    );
}
