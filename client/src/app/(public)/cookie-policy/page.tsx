import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Cookie Policy',
    description: 'CODIE Cookie Policy — how we use cookies and similar tracking technologies.',
}

const EFFECTIVE_DATE = 'October 14, 2025'
const CONTACT_EMAIL = 'privacy@codie.dev'

const cookieTypes = [
    {
        name: 'Strictly Necessary',
        required: true,
        examples: 'Session token, CSRF token, auth cookie',
        purpose:
            'These cookies are essential for the platform to function. They enable authentication, security checks, and session management. You cannot opt out of these.',
    },
    {
        name: 'Functional',
        required: false,
        examples: 'Language preference, editor theme, last project ID',
        purpose:
            'These cookies remember your preferences to provide a personalised experience. Disabling them may affect how the platform feels but will not prevent core functionality.',
    },
    {
        name: 'Analytics',
        required: false,
        examples: 'Page views, feature usage, error rates (anonymised)',
        purpose:
            'We use anonymised analytics to understand how users interact with CODIE so we can improve the product. Data is never sold. We use self-hosted or privacy-first tools wherever possible.',
    },
    {
        name: 'Marketing',
        required: false,
        examples: 'Campaign attribution, referral source',
        purpose:
            'If you arrived at CODIE via a paid campaign or partner link, a cookie may record that attribution. We do not serve third-party advertising on the CODIE platform.',
    },
]

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-[#0d0f12] text-white">
            <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">

                <div className="mb-10">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#1bf07c]">Legal</span>
                    <h1 className="text-4xl font-bold mt-3 mb-2">Cookie Policy</h1>
                    <p className="text-sm text-gray-500">Effective date: {EFFECTIVE_DATE}</p>
                </div>

                <div className="prose prose-invert max-w-none space-y-10 text-gray-300 leading-relaxed">

                    <p>
                        This Cookie Policy explains how CODIE (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) uses cookies and similar technologies when you
                        visit or use our platform. Along with our{' '}
                        <Link href="/privacy" className="text-[#1bf07c] hover:underline">Privacy Policy</Link>, this document describes
                        how we handle information collected through these technologies.
                    </p>

                    <Section title="1. What Are Cookies?">
                        <p>
                            Cookies are small text files that a website stores on your device when you visit. They are widely used to make
                            websites function efficiently, remember your preferences, and provide reporting information to site owners.
                            Similar technologies include web beacons, pixels, local storage, and session storage — this policy applies to
                            all of them.
                        </p>
                    </Section>

                    <Section title="2. How We Use Cookies">
                        <p>CODIE uses cookies for the following purposes:</p>
                        <div className="space-y-4 mt-4">
                            {cookieTypes.map(({ name, required, examples, purpose }) => (
                                <div key={name} className="bg-white/5 border border-white/10 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-2 gap-4">
                                        <h3 className="text-base font-semibold text-white">{name}</h3>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${required
                                                ? 'bg-[#1bf07c]/10 text-[#1bf07c]'
                                                : 'bg-white/10 text-gray-400'
                                            }`}>
                                            {required ? 'Required' : 'Optional'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">{purpose}</p>
                                    <p className="text-xs text-gray-600"><strong className="text-gray-500">Examples:</strong> {examples}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="3. Third-Party Cookies">
                        <p>
                            Some functionality on CODIE is provided by third-party services that may set their own cookies:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                            <li><strong className="text-white">Razorpay</strong>: Payment processing — sets cookies to handle secure payment sessions.</li>
                            <li><strong className="text-white">GitHub OAuth</strong>: If you log in via GitHub, GitHub may set authentication cookies on its domain.</li>
                            <li><strong className="text-white">Analytics</strong>: We may use privacy-first analytics tools that do not use third-party tracking cookies.</li>
                        </ul>
                        <p className="mt-3">
                            We do not use Google Analytics, Facebook Pixel, or any other ad-network tracking cookies on CODIE.
                        </p>
                    </Section>

                    <Section title="4. Cookie Duration">
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 pr-6 text-white font-semibold">Type</th>
                                        <th className="text-left py-3 text-white font-semibold">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { type: 'Session cookies', duration: 'Deleted when you close your browser' },
                                        { type: 'Auth token', duration: '7 days (persistent, refreshed on activity)' },
                                        { type: 'Preference cookies', duration: '1 year' },
                                        { type: 'Analytics cookies', duration: 'Up to 13 months, then anonymised' },
                                    ].map(({ type, duration }) => (
                                        <tr key={type} className="text-gray-400">
                                            <td className="py-3 pr-6 font-medium text-white">{type}</td>
                                            <td className="py-3">{duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    <Section title="5. Managing Your Cookie Preferences">
                        <SubSection title="5.1 Browser Settings">
                            Most browsers allow you to control cookies through their settings. You can block, delete, or restrict cookies at any time.
                            Note that blocking essential cookies may prevent you from logging in or using core features.
                        </SubSection>
                        <SubSection title="5.2 In-App Controls">
                            For non-essential cookies, you can update your preferences at any time from your Account Settings under
                            Privacy &amp; Data. Essential cookies cannot be disabled as they are required for the platform to function.
                        </SubSection>
                        <SubSection title="5.3 Opt-Out Links">
                            <span>
                                If you would like to opt out of any analytics tracking, please email us at{' '}
                                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1bf07c] hover:underline">{CONTACT_EMAIL}</a>{' '}
                                and we will process your request within 30 days.
                            </span>
                        </SubSection>
                    </Section>

                    <Section title="6. Do Not Track">
                        <p>
                            Some browsers offer a &quot;Do Not Track&quot; (DNT) signal. We respect DNT signals where technically feasible. When we
                            detect a DNT signal, we limit data collection to strictly necessary cookies only.
                        </p>
                    </Section>

                    <Section title="7. Changes to This Policy">
                        <p>
                            We may update this Cookie Policy when we add or change how we use cookies. Material changes will be communicated
                            via an in-app banner or email at least 14 days before they take effect.
                        </p>
                    </Section>

                    <Section title="8. Contact Us">
                        <p>
                            If you have questions about our use of cookies, please contact us at{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1bf07c] hover:underline">{CONTACT_EMAIL}</a>{' '}
                            or visit our <Link href="/contact" className="text-[#1bf07c] hover:underline">Contact page</Link>.
                        </p>
                    </Section>

                </div>
            </div>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{title}</h2>
            <div className="space-y-3">{children}</div>
        </section>
    )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
            <p className="text-gray-400">{children}</p>
        </div>
    )
}
