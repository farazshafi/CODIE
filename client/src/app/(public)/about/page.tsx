import Link from 'next/link'
import { Metadata } from 'next'
import {
    Users, Code2, Rocket, GraduationCap, Globe, Heart,
    Video, MessageSquare, ShieldCheck, ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'About',
    description: 'Learn about CODIE — the collaborative code editor and live teaching platform built for modern developers and educators.',
}

const team = [
    {
        name: 'Faraz Shafi',
        role: 'Founder & Lead Engineer',
        bio: 'Full-stack engineer passionate about real-time systems, distributed collaboration tools, and developer education.',
    },
]

const values = [
    {
        icon: <Code2 className="w-6 h-6 text-[#1bf07c]" />,
        title: 'Code First',
        description: 'We believe the best way to learn is by doing. Every feature is designed to get you into code faster.',
    },
    {
        icon: <Users className="w-6 h-6 text-[#1bf07c]" />,
        title: 'Collaboration Over Competition',
        description: 'Knowledge grows when shared. We build tools that bring developers and educators closer together.',
    },
    {
        icon: <Heart className="w-6 h-6 text-[#1bf07c]" />,
        title: 'Inclusivity',
        description: 'Great software should be accessible to everyone — regardless of location, background, or experience.',
    },
    {
        icon: <Rocket className="w-6 h-6 text-[#1bf07c]" />,
        title: 'Ship What Matters',
        description: 'We move fast, iterate continuously, and listen to our users to build features that make a real difference.',
    },
]

const milestones = [
    { year: '2024', event: 'CODIE concept born from the gap between video calls and code editors in online education.' },
    { year: '2024 Q3', event: 'First working prototype — real-time Monaco editor syncing over WebSockets.' },
    { year: '2024 Q4', event: 'WebRTC video/audio huddles integrated directly inside the editor.' },
    { year: '2025', event: 'Launched code execution (Piston API), AI explanations, and subscription plans.' },
    { year: '2025+', event: 'Expanding to team workspaces, CI integrations, and mobile-friendly collaboration.' },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0d0f12] text-white">

            {/* ── Hero ── */}
            <section className="relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1bf07c]/5 via-transparent to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 md:px-10 py-24 text-center">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1bf07c] mb-4">
                        Our Story
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        Built for the way<br className="hidden sm:block" /> developers actually work
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        CODIE was born from a simple frustration: teaching code live meant jumping between video calls, shared screens,
                        and editors that were never built for collaboration. We decided to fix that.
                    </p>
                </div>
            </section>

            {/* ── Mission ── */}
            <section className="py-20 border-b border-white/10">
                <div className="max-w-5xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We are on a mission to make collaborative software development and live coding education seamless, powerful,
                            and accessible to anyone with an internet connection.
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            Whether you are a teacher guiding students through their first Python program, a senior engineer reviewing
                            code with a remote team, or a developer sharing a clever snippet — CODIE is the place to do it.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: <GraduationCap className="w-7 h-7 text-[#1bf07c]" />, label: 'Educators', count: '500+' },
                            { icon: <Code2 className="w-7 h-7 text-[#1bf07c]" />, label: 'Developers', count: '2,000+' },
                            { icon: <Globe className="w-7 h-7 text-[#1bf07c]" />, label: 'Countries', count: '40+' },
                            { icon: <Video className="w-7 h-7 text-[#1bf07c]" />, label: 'Live Sessions', count: '10,000+' },
                        ].map(({ icon, label, count }) => (
                            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-2">
                                {icon}
                                <span className="text-2xl font-bold">{count}</span>
                                <span className="text-sm text-gray-500">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="py-20 border-b border-white/10">
                <div className="max-w-5xl mx-auto px-6 md:px-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">What We Stand For</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map(({ icon, title, description }) => (
                            <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#1bf07c]/30 transition-all duration-200">
                                <div className="mb-4">{icon}</div>
                                <h3 className="text-base font-semibold mb-2">{title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Timeline ── */}
            <section className="py-20 border-b border-white/10">
                <div className="max-w-3xl mx-auto px-6 md:px-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How We Got Here</h2>
                    <div className="space-y-8">
                        {milestones.map(({ year, event }, i) => (
                            <div key={i} className="flex gap-5">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#1bf07c] mt-1.5 shrink-0" />
                                    {i < milestones.length - 1 && <div className="w-px flex-1 bg-white/10 my-2" />}
                                </div>
                                <div className="pb-4">
                                    <span className="text-xs font-semibold text-[#1bf07c] uppercase tracking-widest">{year}</span>
                                    <p className="text-gray-300 mt-1 leading-relaxed">{event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Team ── */}
            <section className="py-20 border-b border-white/10">
                <div className="max-w-4xl mx-auto px-6 md:px-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">The Team</h2>
                    <div className="flex flex-wrap justify-center gap-8">
                        {team.map(({ name, role, bio }) => (
                            <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm text-center hover:border-[#1bf07c]/30 transition-all">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1bf07c]/20 to-[#1bf07c]/5 border border-[#1bf07c]/30 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-[#1bf07c]">{name[0]}</span>
                                </div>
                                <h3 className="text-lg font-semibold">{name}</h3>
                                <p className="text-xs text-[#1bf07c] font-medium mt-1 mb-3">{role}</p>
                                <p className="text-sm text-gray-500 leading-relaxed">{bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
                    <MessageSquare className="w-10 h-10 text-[#1bf07c] mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to get in touch?</h2>
                    <p className="text-gray-400 mb-8">We would love to hear your thoughts, feedback, or collaboration ideas.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1bf07c] text-black font-semibold hover:bg-[#0fd868] transition-all duration-200">
                            Contact Us <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/docs" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:border-[#1bf07c]/40 hover:text-[#1bf07c] transition-all duration-200">
                            <ShieldCheck className="w-4 h-4" /> Read the Docs
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
