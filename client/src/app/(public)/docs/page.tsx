import { Metadata } from 'next'
import Link from 'next/link'
import {
    BookOpen, Code2, Users, Settings, Video, MessageSquare,
    Share2, Lock, ChevronRight, ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Documentation',
    description: 'Learn how to use CODIE — create projects, collaborate in real-time, enable video huddles, manage roles, and share code snippets.',
}

const sections = [
    { id: 'create-project', label: 'Creating a Project', icon: Code2 },
    { id: 'enable-contribution', label: 'Enabling Contribution', icon: Users },
    { id: 'change-role', label: 'Changing Contributor Roles', icon: Settings },
    { id: 'video-call', label: 'Video & Audio Huddles', icon: Video },
    { id: 'chat', label: 'In-Editor Chat', icon: MessageSquare },
    { id: 'share-snippet', label: 'Sharing Snippets', icon: Share2 },
]

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[#0d0f12] text-white">
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 flex gap-12">

                {/* ── Sidebar ── */}
                <aside className="hidden lg:block w-56 shrink-0">
                    <div className="sticky top-24">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">On this page</p>
                        <nav className="flex flex-col gap-1">
                            {sections.map(({ id, label, icon: Icon }) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-[#1bf07c] hover:bg-white/5 transition-all duration-150"
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {label}
                                </a>
                            ))}
                        </nav>
                        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-gray-500 mb-3">Need help?</p>
                            <Link href="/contact" className="inline-flex items-center gap-1 text-xs text-[#1bf07c] hover:underline">
                                Contact support <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 min-w-0">

                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <BookOpen className="w-4 h-4" />
                            <span>Documentation</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-white">Getting Started</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">CODIE Documentation</h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Everything you need to start collaborating, teaching, and building with CODIE.
                        </p>
                    </div>

                    {/* ─────────────── SECTION 1: Create a Project ─────────────── */}
                    <section id="create-project" className="mb-16 scroll-mt-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1bf07c]/10 flex items-center justify-center">
                                <Code2 className="w-4 h-4 text-[#1bf07c]" />
                            </div>
                            <h2 className="text-2xl font-bold">Creating a Project</h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>A <strong className="text-white">project</strong> in CODIE is a collaborative coding room where you and your teammates can write, run, and discuss code in real-time.</p>
                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Steps</h3>
                            <ol className="list-none space-y-3">
                                {[
                                    'Log in to your CODIE account and go to the Dashboard.',
                                    'Click the "New Project" button in the top-right corner.',
                                    'Give your project a name and select a primary programming language.',
                                    'Choose visibility: Private (invite-only) or Public (anyone with the link can view).',
                                    'Click "Create Project". You will be taken directly into the editor.',
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1bf07c]/10 text-[#1bf07c] text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4">
                                <p className="text-sm text-gray-400"><strong className="text-[#1bf07c]">Tip:</strong> You can switch languages at any time from the language selector in the editor toolbar. Existing code is preserved as a comment.</p>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-white/10 mb-16" />

                    {/* ─────────────── SECTION 2: Enable Contribution ─────────────── */}
                    <section id="enable-contribution" className="mb-16 scroll-mt-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1bf07c]/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-[#1bf07c]" />
                            </div>
                            <h2 className="text-2xl font-bold">Enabling Contribution</h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>By default, new projects are private. You must explicitly invite collaborators or enable a join link so others can contribute.</p>
                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Inviting collaborators</h3>
                            <ol className="list-none space-y-3">
                                {[
                                    'Inside your project, click the "Invite" button in the top bar.',
                                    'Search for users by username or email address.',
                                    'Select the role you want to assign (Viewer or Contributor).',
                                    'Click "Send Invite". The user receives a notification and can join immediately.',
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1bf07c]/10 text-[#1bf07c] text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Enabling a public join link</h3>
                            <ol className="list-none space-y-3">
                                {[
                                    'Open Project Settings (gear icon in the top bar).',
                                    'Toggle "Allow anyone with link to join" to ON.',
                                    'Copy the generated room link and share it.',
                                    'New joiners submit a Join Request that you can accept or decline from the sidebar.',
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1bf07c]/10 text-[#1bf07c] text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    <div className="border-t border-white/10 mb-16" />

                    {/* ─────────────── SECTION 3: Change Role ─────────────── */}
                    <section id="change-role" className="mb-16 scroll-mt-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1bf07c]/10 flex items-center justify-center">
                                <Settings className="w-4 h-4 text-[#1bf07c]" />
                            </div>
                            <h2 className="text-2xl font-bold">Changing Contributor Roles</h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>CODIE has three participant roles within a project room:</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm mt-2">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 pr-6 text-white font-semibold">Role</th>
                                            <th className="text-left py-3 pr-6 text-white font-semibold">Edit Code</th>
                                            <th className="text-left py-3 pr-6 text-white font-semibold">Run Code</th>
                                            <th className="text-left py-3 text-white font-semibold">Lock Lines / Manage Room</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { role: 'Owner', edit: '✓', run: '✓', manage: '✓ (full control)' },
                                            { role: 'Contributor', edit: '✓', run: '✓', manage: '✗' },
                                            { role: 'Viewer', edit: '✗', run: '✗', manage: '✗' },
                                        ].map(({ role, edit, run, manage }) => (
                                            <tr key={role} className="text-gray-400">
                                                <td className="py-3 pr-6 font-medium text-white">{role}</td>
                                                <td className="py-3 pr-6">{edit}</td>
                                                <td className="py-3 pr-6">{run}</td>
                                                <td className="py-3">{manage}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Changing a role</h3>
                            <ol className="list-none space-y-3">
                                {[
                                    'Open the Participants panel on the right sidebar.',
                                    'Hover over the participant whose role you want to change.',
                                    'Click the role badge (e.g., "Viewer") to open the role selector.',
                                    'Select the new role. Changes take effect immediately.',
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1bf07c]/10 text-[#1bf07c] text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4">
                                <p className="text-sm text-gray-400"><strong className="text-[#1bf07c]">Note:</strong> Only the room Owner can change roles. The Owner role itself cannot be transferred from within a room — use Project Settings to transfer ownership.</p>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-white/10 mb-16" />

                    {/* ─────────────── SECTION 4: Video & Audio ─────────────── */}
                    <section id="video-call" className="mb-16 scroll-mt-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1bf07c]/10 flex items-center justify-center">
                                <Video className="w-4 h-4 text-[#1bf07c]" />
                            </div>
                            <h2 className="text-2xl font-bold">Video & Audio Huddles</h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>CODIE includes browser-native WebRTC video and audio — no plugins, no third-party apps required.</p>
                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Starting a huddle</h3>
                            <ol className="list-none space-y-3">
                                {[
                                    'Inside the editor, locate the Huddle bar at the bottom of the screen.',
                                    'Click the camera icon to join with video, or the microphone icon for audio-only.',
                                    'Your browser will request camera and microphone permissions — click "Allow".',
                                    'Other room participants will see a notification to join the huddle.',
                                    'Video tiles appear in a draggable grid overlay. Resize or minimise as needed.',
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1bf07c]/10 text-[#1bf07c] text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Controls during a huddle</h3>
                            <ul className="space-y-2 text-sm">
                                {[
                                    { label: 'Mute / Unmute', desc: 'Click the microphone icon in your tile or the huddle bar.' },
                                    { label: 'Toggle camera', desc: 'Click the camera icon to turn your video on or off.' },
                                    { label: 'Raise hand', desc: 'Click the hand icon to signal the host without interrupting.' },
                                    { label: 'Leave huddle', desc: 'Click the red phone icon to exit without leaving the project.' },
                                ].map(({ label, desc }) => (
                                    <li key={label} className="flex gap-2">
                                        <span className="text-[#1bf07c] font-medium w-36 shrink-0">{label}</span>
                                        <span className="text-gray-400">{desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <div className="border-t border-white/10 mb-16" />

                    {/* ─────────────── SECTION 5: Chat ─────────────── */}
                    <section id="chat" className="mb-16 scroll-mt-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1bf07c]/10 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-[#1bf07c]" />
                            </div>
                            <h2 className="text-2xl font-bold">In-Editor Chat</h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>Every CODIE room has a persistent chat panel so teammates can communicate without leaving the editor.</p>
                            <ol className="list-none space-y-3">
                                {[
                                    'Click the chat bubble icon in the right sidebar to open the Chat panel.',
                                    'Type your message in the input at the bottom and press Enter or click Send.',
                                    'Messages are visible to all room participants in real-time.',
                                    'To mention a collaborator, type @ followed by their username.',
                                    'Chat history persists for the lifetime of the project room.',
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1bf07c]/10 text-[#1bf07c] text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    <div className="border-t border-white/10 mb-16" />

                    {/* ─────────────── SECTION 6: Share Snippet ─────────────── */}
                    <section id="share-snippet" className="mb-16 scroll-mt-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1bf07c]/10 flex items-center justify-center">
                                <Share2 className="w-4 h-4 text-[#1bf07c]" />
                            </div>
                            <h2 className="text-2xl font-bold">Sharing Snippets</h2>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>Snippets let you save and share standalone code blocks — perfect for tutorials, Stack Overflow answers, or reusable helpers.</p>
                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Creating a snippet</h3>
                            <ol className="list-none space-y-3">
                                {[
                                    'Select the code you want to share in the editor (or leave blank to share the entire file).',
                                    'Click the Share icon in the editor toolbar and choose "Create Snippet".',
                                    'Add an optional title and description, then choose Public or Private.',
                                    'Click "Save Snippet". A unique snippet URL is generated.',
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1bf07c]/10 text-[#1bf07c] text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Viewing and managing snippets</h3>
                            <ul className="space-y-2 list-disc list-inside text-sm text-gray-400">
                                <li>Go to your profile and click the <strong className="text-white">Snippets</strong> tab to see all your snippets.</li>
                                <li>Click any snippet to open a read-only view with syntax highlighting.</li>
                                <li>Public snippets can be forked by other CODIE users into their own projects.</li>
                                <li>Delete a snippet from the three-dot menu on your Snippets page.</li>
                            </ul>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4">
                                <div className="flex items-start gap-3">
                                    <Lock className="w-4 h-4 text-[#1bf07c] shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-400">Private snippets are only accessible to you and users you share the direct link with. They do not appear in public search or discovery.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Footer nav ── */}
                    <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <p className="text-sm text-gray-500">Was this page helpful? <Link href="/contact" className="text-[#1bf07c] hover:underline">Let us know →</Link></p>
                        <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1bf07c] text-black text-sm font-semibold hover:bg-[#0fd868] transition-all duration-200">
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    )
}
