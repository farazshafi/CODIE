export const dynamic = "force-dynamic";
import CodeAnimation from '@/components/codeAnimation'
import FeatureCard from '@/components/featureCard'
import Subscription from '@/components/Subscription'
import PageTransitionWrapper from '@/components/TransitionWrapper'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Code2,
  GraduationCap,
  Lock,
  MessageSquare,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Video
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { getSubscriptions } from './(protected)/plan/page'

const page = async () => {

  const subscriptions = await getSubscriptions();

  const hasPlans = Array.isArray(subscriptions) && subscriptions.length > 0;

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-primary text-white overflow-x-hidden">

        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="w-full pt-12 lg:pt-16 pb-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
            <div className="w-full lg:w-1/2 max-w-xl lg:max-w-none">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-bold mb-6 tracking-tight leading-tight">
                Collaborative Code Editor & Live Teaching Platform
              </h1>
              <p className="text-base md:text-lg lg:text-base xl:text-lg mb-8 text-gray-300 leading-relaxed">
                Teach coding live, assign hands-on practical work, fix errors in real-time while students & peers observe, and collaborate face-to-face via video/audio huddles—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-green hover:bg-green-800 hover:text-white text-black px-8 py-6 rounded-xl text-base font-semibold transition-all"
                  asChild
                >
                  <Link href="/register">Start Coding Free <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 max-w-xl lg:max-w-none mt-6 lg:mt-0">
              <CodeAnimation />
            </div>
          </div>
        </section>

        {/* Live Teaching & Use-Case Showcase */}
        <section className="py-16 bg-black/60 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs uppercase tracking-widest text-green-400 font-semibold mb-3">
                All-In-One Classroom & Developer Hub
              </h2>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Designed for Teachers, Students & Developers
              </h3>
              <p className="text-gray-400 text-base md:text-lg">
                No more jumping between zoom, code editors, and terminals. CODIE brings video huddles, live execution, and interactive mentorship together into a single room.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-primary/80 border border-white/10 rounded-2xl p-8 flex flex-col items-start relative overflow-hidden group hover:border-green-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-6 font-bold text-xl">
                  1
                </div>
                <h4 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-400" /> Host Live Sessions
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Teachers and team leads create live coding rooms with access approval controls, video huddles, and instant room invites.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-primary/80 border border-white/10 rounded-2xl p-8 flex flex-col items-start relative overflow-hidden group hover:border-green-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 font-bold text-xl">
                  2
                </div>
                <h4 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-400" /> Practical Hands-On Coding
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Students write code live with multi-cursor syncing, execution output console, and real-time audio/video interaction.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-primary/80 border border-white/10 rounded-2xl p-8 flex flex-col items-start relative overflow-hidden group hover:border-green-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 font-bold text-xl">
                  3
                </div>
                <h4 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-400" /> Real-time Fixes & Peer View
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Teachers lock lines, fix errors on the fly, and demonstrate solutions live while peers observe and learn synchronously.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features section */}
        <section style={{ background: 'linear-gradient(to bottom, #000000, #1f2125)' }} className="py-24 bg-black/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-center mb-4 bg-clip-text mygreen">
              Powerful Features Built for Collaboration
            </h2>
            <p className="text-gray-400 text-center text-base md:text-lg max-w-2xl mx-auto mb-16">
              Everything you need to teach, learn, program, and build applications together in real-time.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Video className="w-10 h-10 text-green-400" />}
                title="WebRTC Video & Audio Huddles"
                description="Integrated face-to-face video grid, audio waveform visualizers, mic toggles, and raised hands directly inside the editor."
              />
              <FeatureCard
                icon={<Play className="w-10 h-10 text-white" />}
                title="Live Code Execution & Console"
                description="Run JavaScript, Python, C++, Java, and more with instant execution output powered by Piston API."
              />
              <FeatureCard
                icon={<Lock className="w-10 h-10 text-green-400" />}
                title="Line & Selection Locking"
                description="Teachers can lock code lines during live coding to guide students step-by-step and prevent concurrent editing conflicts."
              />
              <FeatureCard
                icon={<GraduationCap className="w-10 h-10 text-white" />}
                title="Live Teaching & Mentorship"
                description="Students perform practical coding while teachers inspect, fix bugs live, and let peers observe solutions in real-time."
              />
              <FeatureCard
                icon={<Users className="w-10 h-10 text-green-400" />}
                title="Multi-Cursor Monaco Editor"
                description="Low-latency real-time collaboration with cursor tracking, presence badges, and active collaborator lists via WebSockets."
              />
              <FeatureCard
                icon={<MessageSquare className="w-10 h-10 text-white" />}
                title="In-Editor Chat & Join Controls"
                description="Classroom room chat paired with host join request controls for seamless session access management."
              />
              <FeatureCard
                icon={<Sparkles className="w-10 h-10 text-green-400" />}
                title="AI Code Explanations"
                description="Get intelligent code explanations, debugging insights, and performance optimization tips powered by AI."
              />
              <FeatureCard
                icon={<Rocket className="w-10 h-10 text-white" />}
                title="Instant One-Click Deployment"
                description="Deploy your collaborative projects directly to the cloud and share them with the world instantly."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-10 h-10 text-green-400" />}
                title="Project Discovery & Forking"
                description="Browse community projects, fork repositories, star highlights, and contribute to developer open-source."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        {hasPlans ? (
          <Subscription plan={subscriptions} />
        ) : (
          <div className="text-center text-white py-10">
            <h2 className="text-2xl">No subscription plans available.</h2>
            <p className="text-gray-400 mt-2">Please try again later.</p>
          </div>
        )}

        {/* CTA Section */}
        <section style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-6">
              Ready to transform your coding and teaching experience?
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300 mb-12">
              Join students, teachers, and developers building, learning, and collaborating together on CODIE.
            </p>
            <Button
              className="bg-green text-black hover:bg-green-700 hover:text-white px-8 py-6 rounded-xl text-lg font-semibold inline-flex items-center gap-2 transition-all"
              asChild
            >
              <Link href="/register">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

      </div>
    </PageTransitionWrapper>
  )
}

export default page;