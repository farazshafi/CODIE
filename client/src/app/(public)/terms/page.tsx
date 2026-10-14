import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'CODIE Terms of Service — the rules and conditions governing use of the CODIE platform.',
}

const EFFECTIVE_DATE = 'October 14, 2025'
const CONTACT_EMAIL = 'legal@codie.dev'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0d0f12] text-white">
            <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">

                <div className="mb-10">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#1bf07c]">Legal</span>
                    <h1 className="text-4xl font-bold mt-3 mb-2">Terms of Service</h1>
                    <p className="text-sm text-gray-500">Effective date: {EFFECTIVE_DATE}</p>
                </div>

                <div className="prose prose-invert max-w-none space-y-10 text-gray-300 leading-relaxed">

                    <p>
                        Please read these Terms of Service (&quot;Terms&quot;) carefully before using the CODIE platform operated by CODIE
                        (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using CODIE, you agree to be bound by these Terms.
                        If you do not agree, you may not use the platform.
                    </p>

                    <Section title="1. Eligibility">
                        <p>
                            You must be at least 13 years of age to use CODIE. By creating an account, you represent and warrant that you
                            meet this requirement. If you are under 18, you confirm that you have parental or guardian consent. We reserve
                            the right to terminate accounts that violate this requirement.
                        </p>
                    </Section>

                    <Section title="2. Your Account">
                        <p>
                            You are responsible for maintaining the confidentiality of your login credentials. You are liable for all
                            activities that occur under your account. If you suspect unauthorised access, notify us immediately at{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1bf07c] hover:underline">{CONTACT_EMAIL}</a>.
                        </p>
                        <p>
                            You may not create accounts for fraudulent purposes, impersonate others, or use automated scripts to create
                            large numbers of accounts.
                        </p>
                    </Section>

                    <Section title="3. Acceptable Use">
                        <p>You agree not to use CODIE to:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                            <li>Upload, transmit, or share malware, viruses, or malicious code.</li>
                            <li>Attempt to gain unauthorised access to any system, server, or user data.</li>
                            <li>Harass, intimidate, threaten, or harm other users.</li>
                            <li>Distribute spam, phishing links, or unsolicited commercial messages.</li>
                            <li>Violate any applicable local, national, or international law or regulation.</li>
                            <li>Infringe the intellectual property rights of third parties.</li>
                            <li>Scrape, crawl, or extract data from CODIE without our written permission.</li>
                            <li>Reverse engineer, decompile, or disassemble any part of the platform.</li>
                            <li>Use CODIE to generate, distribute, or store CSAM or other illegal content.</li>
                        </ul>
                        <p className="mt-3">
                            We reserve the right to suspend or terminate accounts that violate this policy, with or without prior notice.
                        </p>
                    </Section>

                    <Section title="4. Intellectual Property">
                        <SubSection title="4.1 Your Content">
                            You retain all intellectual property rights to the code, projects, and content you create on CODIE. By
                            uploading content, you grant us a limited, non-exclusive, royalty-free licence to host, display, and transmit
                            your content solely for the purpose of operating the service.
                        </SubSection>
                        <SubSection title="4.2 Our Platform">
                            CODIE, its logo, trademarks, and all underlying technology are the exclusive property of CODIE. Nothing in
                            these Terms grants you a right to use our brand assets without written permission.
                        </SubSection>
                        <SubSection title="4.3 Open Source">
                            Certain components of CODIE may be released under open-source licences. Those licences govern your use of
                            those specific components and are in addition to these Terms.
                        </SubSection>
                    </Section>

                    <Section title="5. Subscription and Payments">
                        <p>
                            CODIE offers free and paid subscription tiers. Paid subscriptions are billed through Razorpay. By subscribing,
                            you authorise us to charge the applicable fees to your payment method on the billing cycle you select.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
                            <li><strong className="text-white">Cancellation:</strong> You may cancel at any time. Access continues until the end of your billing period.</li>
                            <li><strong className="text-white">Refunds:</strong> We offer a 7-day refund for first-time paid subscriptions if you are not satisfied. Contact support within 7 days of your first charge.</li>
                            <li><strong className="text-white">Price changes:</strong> We will notify you at least 30 days before changing subscription prices. Continued use after the effective date constitutes acceptance.</li>
                        </ul>
                    </Section>

                    <Section title="6. Service Availability">
                        <p>
                            We strive for high availability but do not guarantee uninterrupted access. We may suspend the service for
                            maintenance, security updates, or circumstances beyond our control. We are not liable for losses resulting
                            from downtime.
                        </p>
                    </Section>

                    <Section title="7. Privacy">
                        <p>
                            Your use of CODIE is also governed by our{' '}
                            <Link href="/privacy" className="text-[#1bf07c] hover:underline">Privacy Policy</Link>, which is incorporated
                            into these Terms by reference.
                        </p>
                    </Section>

                    <Section title="8. Third-Party Services">
                        <p>
                            CODIE integrates with third-party services (e.g., GitHub OAuth, Razorpay, Piston API). Your use of those
                            services is subject to their respective terms. We are not responsible for the practices of third-party providers.
                        </p>
                    </Section>

                    <Section title="9. Disclaimer of Warranties">
                        <p>
                            CODIE is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express
                            or implied, including but not limited to fitness for a particular purpose, merchantability, or non-infringement.
                            We do not warrant that the platform will be error-free, secure, or uninterrupted.
                        </p>
                    </Section>

                    <Section title="10. Limitation of Liability">
                        <p>
                            To the maximum extent permitted by law, CODIE and its affiliates, officers, employees, and agents shall not
                            be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits,
                            data, or goodwill — arising from your use of the platform. Our total liability to you for any direct damages
                            shall not exceed the amount you paid us in the 12 months preceding the claim.
                        </p>
                    </Section>

                    <Section title="11. Indemnification">
                        <p>
                            You agree to indemnify, defend, and hold harmless CODIE and its team from any claims, liabilities, damages,
                            and expenses (including legal fees) arising from your violation of these Terms, your User Content, or your
                            use of the platform.
                        </p>
                    </Section>

                    <Section title="12. Termination">
                        <p>
                            We may suspend or terminate your access to CODIE at any time, with or without notice, for any violation of
                            these Terms or for any other reason at our sole discretion. You may deactivate your account at any time through
                            Account Settings. Upon termination, your right to use the service ceases immediately.
                        </p>
                    </Section>

                    <Section title="13. Governing Law and Dispute Resolution">
                        <p>
                            These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under
                            these Terms shall be subject to the exclusive jurisdiction of the courts located in India.
                            For informal resolution, please contact us first at{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1bf07c] hover:underline">{CONTACT_EMAIL}</a>.
                        </p>
                    </Section>

                    <Section title="14. Changes to These Terms">
                        <p>
                            We may update these Terms as our platform evolves. We will notify you of material changes via email or an
                            in-app notice at least 14 days before they take effect. Your continued use of CODIE after that date
                            constitutes acceptance of the revised Terms.
                        </p>
                    </Section>

                    <Section title="15. Contact">
                        <p>
                            For questions about these Terms, contact us at{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1bf07c] hover:underline">{CONTACT_EMAIL}</a>{' '}
                            or through our <Link href="/contact" className="text-[#1bf07c] hover:underline">Contact page</Link>.
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
