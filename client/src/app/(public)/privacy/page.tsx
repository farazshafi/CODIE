import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'CODIE Privacy Policy — how we collect, use, and protect your personal information.',
}

const EFFECTIVE_DATE = 'October 14, 2025'
const CONTACT_EMAIL = 'privacy@codie.dev'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0d0f12] text-white">
            <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">

                <div className="mb-10">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#1bf07c]">Legal</span>
                    <h1 className="text-4xl font-bold mt-3 mb-2">Privacy Policy</h1>
                    <p className="text-sm text-gray-500">Effective date: {EFFECTIVE_DATE}</p>
                </div>

                <div className="prose prose-invert max-w-none space-y-10 text-gray-300 leading-relaxed">

                    <p>
                        CODIE (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
                        explains what information we collect, how we use it, with whom we share it, and what rights you have over your data.
                        By using CODIE, you agree to the practices described below.
                    </p>

                    <Section title="1. Information We Collect">
                        <SubSection title="1.1 Account Information">
                            When you register, we collect your name, email address, and a hashed password. If you sign up via a third-party OAuth
                            provider (e.g., GitHub), we receive the profile information you authorise that provider to share.
                        </SubSection>
                        <SubSection title="1.2 Project and Usage Data">
                            We store the code, chat messages, and file contents you create within CODIE projects. We also record metadata
                            such as project names, room activity timestamps, programming language selections, and feature usage patterns.
                        </SubSection>
                        <SubSection title="1.3 Payment Information">
                            If you subscribe to a paid plan, payment is processed by Razorpay. We do not store your full card details.
                            We retain transaction IDs and subscription status for billing and support purposes.
                        </SubSection>
                        <SubSection title="1.4 Technical Data">
                            We automatically collect your IP address, browser type, operating system, referring URLs, and device identifiers.
                            We use cookies and similar tracking technologies (see our <Link href="/cookie-policy" className="text-[#1bf07c] hover:underline">Cookie Policy</Link>).
                        </SubSection>
                        <SubSection title="1.5 Communications">
                            If you contact our support team, we retain the content of your messages to resolve your request and improve our service.
                        </SubSection>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <ul className="list-disc list-inside space-y-2 text-gray-400">
                            <li>To create and manage your account and authenticate your sessions.</li>
                            <li>To provide real-time collaborative editing, code execution, and video/audio huddle features.</li>
                            <li>To process payments and manage subscription plans.</li>
                            <li>To send transactional emails (e.g., account verification, password reset, billing receipts).</li>
                            <li>To send product updates and newsletters — only with your explicit consent.</li>
                            <li>To diagnose bugs, monitor service health, and improve performance.</li>
                            <li>To detect, prevent, and respond to fraud, abuse, or security incidents.</li>
                            <li>To comply with legal obligations and enforce our Terms of Service.</li>
                        </ul>
                    </Section>

                    <Section title="3. Legal Basis for Processing (GDPR)">
                        <p>For users in the European Economic Area, we process personal data under the following legal bases:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                            <li><strong className="text-white">Contract</strong>: to fulfil the services you have signed up for.</li>
                            <li><strong className="text-white">Legitimate Interests</strong>: to improve, secure, and market our platform.</li>
                            <li><strong className="text-white">Consent</strong>: for optional marketing communications and non-essential cookies.</li>
                            <li><strong className="text-white">Legal Obligation</strong>: to comply with applicable laws and regulations.</li>
                        </ul>
                    </Section>

                    <Section title="4. Data Sharing and Disclosure">
                        <p>We do not sell your personal data. We share data only in the following circumstances:</p>
                        <SubSection title="4.1 Service Providers">
                            We use trusted third-party vendors to operate our platform, including cloud hosting (AWS), payment processing (Razorpay),
                            error monitoring (Sentry), and email delivery (Resend). These vendors are bound by data processing agreements and
                            may only use your data to provide services to us.
                        </SubSection>
                        <SubSection title="4.2 Collaborators">
                            When you share a project room, other participants in that room can see your username, cursor, and any code, chat,
                            or audio/video you opt to share during the session.
                        </SubSection>
                        <SubSection title="4.3 Legal Requirements">
                            We may disclose your information if required by law, court order, or government authority, or to protect the
                            rights, property, or safety of CODIE, our users, or the public.
                        </SubSection>
                        <SubSection title="4.4 Business Transfers">
                            In the event of a merger, acquisition, or sale of assets, your data may be transferred. We will notify you
                            before your data becomes subject to a different privacy policy.
                        </SubSection>
                    </Section>

                    <Section title="5. Data Retention">
                        <p>
                            We retain your account data for as long as your account is active or as needed to provide our services.
                            Project data is retained until you delete the project or your account. After account deletion, we may retain
                            anonymised aggregated data for analytics. Backup copies may persist for up to 90 days.
                        </p>
                    </Section>

                    <Section title="6. Security">
                        <p>
                            We implement industry-standard security measures including TLS encryption in transit, bcrypt password hashing,
                            JWT-based authentication with short expiry windows, and role-based access controls. Despite these safeguards,
                            no internet transmission is 100% secure. Please use a strong, unique password and enable two-factor authentication
                            where available.
                        </p>
                    </Section>

                    <Section title="7. Your Rights">
                        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                            <li><strong className="text-white">Access</strong>: Request a copy of the data we hold about you.</li>
                            <li><strong className="text-white">Rectification</strong>: Correct inaccurate or incomplete data.</li>
                            <li><strong className="text-white">Erasure</strong>: Request deletion of your personal data (&quot;right to be forgotten&quot;).</li>
                            <li><strong className="text-white">Portability</strong>: Receive your data in a machine-readable format.</li>
                            <li><strong className="text-white">Restriction</strong>: Ask us to limit how we process your data.</li>
                            <li><strong className="text-white">Objection</strong>: Object to processing based on legitimate interests or for direct marketing.</li>
                            <li><strong className="text-white">Withdraw Consent</strong>: At any time, for processing based on consent.</li>
                        </ul>
                        <p className="mt-4">
                            To exercise any of these rights, email us at{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1bf07c] hover:underline">{CONTACT_EMAIL}</a>.
                            We will respond within 30 days.
                        </p>
                    </Section>

                    <Section title="8. Children's Privacy">
                        <p>
                            CODIE is not directed at children under the age of 13. We do not knowingly collect personal data from children.
                            If you believe a child has registered without parental consent, please contact us and we will promptly delete
                            the account.
                        </p>
                    </Section>

                    <Section title="9. International Transfers">
                        <p>
                            Your data may be processed and stored on servers in the United States and other countries. Where data is transferred
                            outside your jurisdiction, we ensure adequate protections are in place (e.g., Standard Contractual Clauses for
                            EEA users).
                        </p>
                    </Section>

                    <Section title="10. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of material changes via email or a prominent
                            notice on our platform at least 14 days before the changes take effect. Your continued use after that date constitutes
                            acceptance of the updated policy.
                        </p>
                    </Section>

                    <Section title="11. Contact Us">
                        <p>
                            For privacy-related questions or to exercise your rights, contact us at:{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1bf07c] hover:underline">{CONTACT_EMAIL}</a>
                            {' '}or through our <Link href="/contact" className="text-[#1bf07c] hover:underline">contact page</Link>.
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
