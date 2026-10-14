"use client";

import { useState } from 'react'
import { Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

const SUPPORT_EMAIL = 'support@codie.dev'

export default function ContactForm() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.name.trim()) e.name = 'Name is required.'
        if (!form.email.trim()) e.email = 'Email is required.'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
        if (!form.subject.trim()) e.subject = 'Please choose a subject.'
        if (!form.message.trim()) e.message = 'Message cannot be empty.'
        else if (form.message.trim().length < 20) e.message = 'Please provide at least 20 characters.'
        return e
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        await new Promise((r) => setTimeout(r, 1200))
        setLoading(false)
        setSubmitted(true)
        setErrors({})
    }

    return (
        <div className="min-h-screen bg-[#0d0f12] text-white">
            <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">

                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#1bf07c]">Get in Touch</span>
                    <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Contact Us</h1>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Have a question, feedback, or a bug to report? We try to respond to all messages within one business day.
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-10">

                    {/* Info panel */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        {[
                            { icon: <Mail className="w-5 h-5 text-[#1bf07c]" />, label: 'Email', value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
                            { icon: <Clock className="w-5 h-5 text-[#1bf07c]" />, label: 'Response Time', value: 'Within 1 business day' },
                            { icon: <MapPin className="w-5 h-5 text-[#1bf07c]" />, label: 'Location', value: 'India (Remote-first team)' },
                        ].map(({ icon, label, value, href }) => (
                            <div key={label} className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-xl">
                                <div className="mt-0.5">{icon}</div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
                                    {href
                                        ? <a href={href} className="text-sm text-white hover:text-[#1bf07c] transition-colors">{value}</a>
                                        : <p className="text-sm text-white">{value}</p>
                                    }
                                </div>
                            </div>
                        ))}

                        <div className="p-5 bg-[#1bf07c]/5 border border-[#1bf07c]/20 rounded-xl">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#1bf07c] mb-2">Quick Links</p>
                            <ul className="space-y-2 text-sm text-gray-400">
                                {[
                                    { label: 'Documentation', href: '/docs' },
                                    { label: 'Privacy Policy', href: '/privacy' },
                                    { label: 'Terms of Service', href: '/terms' },
                                    { label: 'Cookie Policy', href: '/cookie-policy' },
                                ].map(({ label, href }) => (
                                    <li key={label}><a href={href} className="hover:text-[#1bf07c] transition-colors">{label} →</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="md:col-span-3">
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-4">
                                <CheckCircle className="w-14 h-14 text-[#1bf07c]" />
                                <h2 className="text-2xl font-bold">Message Received!</h2>
                                <p className="text-gray-400 max-w-sm">
                                    Thank you for reaching out. We will get back to you within one business day.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-4 text-sm text-[#1bf07c] hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field label="Full Name" id="name" type="text" placeholder="Jane Smith" value={form.name} error={errors.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                                    <Field label="Email Address" id="email" type="email" placeholder="jane@example.com" value={form.email} error={errors.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                                    <select
                                        id="subject"
                                        value={form.subject}
                                        onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 focus:outline-none focus:border-[#1bf07c]/50 transition-all appearance-none"
                                    >
                                        <option value="" disabled>Select a topic</option>
                                        <option value="general">General Enquiry</option>
                                        <option value="billing">Billing &amp; Subscriptions</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="security">Security Concern</option>
                                        <option value="gdpr">Privacy / Data Request</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                                    <textarea
                                        id="message" rows={6}
                                        placeholder="Describe your issue or question in as much detail as possible..."
                                        value={form.message}
                                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#1bf07c]/50 transition-all resize-none"
                                    />
                                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                                </div>

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1bf07c] text-black text-sm font-semibold hover:bg-[#0fd868] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-[#1bf07c]/20"
                                >
                                    {loading ? 'Sending…' : <><Send className="w-4 h-4" /> Send Message</>}
                                </button>

                                <p className="text-xs text-gray-600 text-center">
                                    By submitting this form you agree to our{' '}
                                    <a href="/privacy" className="text-[#1bf07c] hover:underline">Privacy Policy</a>.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Field({ label, id, type, placeholder, value, error, onChange }: {
    label: string; id: string; type: string; placeholder: string;
    value: string; error?: string; onChange: (v: string) => void;
}) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <input
                id={id} type={type} placeholder={placeholder} value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#1bf07c]/50 transition-all"
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    )
}
