"use client"
import CodeAnimation from '@/components/codeAnimation'
import FeatureCard from '@/components/featureCard'
import PricingPlan from '@/components/pricingPlan'
import PageTransitionWrapper from '@/components/TransitionWrapper'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/ui/navbar'
import { ArrowRight, Code, Rocket, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-primary text-white overflow-x-hidden">
        {/* <Navbar /> */}
        {/* hero Section */}
        <section style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="container mx-auto px-10 pt-20 pb-32 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 ">
              Collaborative Code Editor
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Create, collaborate, and share coding projects in real-time with
              developers around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-green hover:bg-green-800 hover:text-white text-black px-8 py-6 rounded-xl text-lg"
                asChild
              >
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <CodeAnimation />
          </div>
        </section>
        {/* Feature section */}
        <section style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="py-24 bg-black/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-clip-text mygreen">
              Powerful Features for Developers
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Code className="w-10 h-10 text-green-400" />}
                title="Live Code Editing"
                description="Write and edit code in real-time with syntax highlighting and auto-completion across all major languages."
              />
              <FeatureCard
                icon={<Users className="w-10 h-10 text-white" />}
                title="Real-time Collaboration"
                description="Work together seamlessly with your team members. See changes as they happen with cursor tracking."
              />
              <FeatureCard
                icon={<Sparkles className="w-10 h-10 text-green-400" />}
                title="AI Code Explanations"
                description="Get intelligent insights and explanations for any piece of code with our AI-powered assistant."
              />
              <FeatureCard
                icon={<Rocket className="w-10 h-10 text-white" />}
                title="Instant Deployment"
                description="Deploy your projects instantly with one click to share with the world."
              />
              <FeatureCard
                icon={<Code className="w-10 h-10 text-green-400" />}
                title="Version Control"
                description="Track changes with built-in version control to never lose your work again."
              />
              <FeatureCard
                icon={<Sparkles className="w-10 h-10 text-white" />}
                title="Project Discovery"
                description="Discover and fork interesting projects from our growing community of developers."
              />
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="py-24 relative">
          <div className="absolute inset-0 bg-priamry opacity-50"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-clip-text">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <PricingPlan
                title="Free"
                price="$0"
                features={[
                  "3 concurrent projects",
                  "Basic code editor",
                  "Limited collaboration",
                  "Community support"
                ]}
                buttonText="Get Started"
                buttonLink="/register"
              />
              <PricingPlan
                title="Pro"
                price="$15"
                period="per month"
                popular={true}
                features={[
                  "Unlimited projects",
                  "Advanced code editor",
                  "Unlimited collaborators",
                  "AI code explanations",
                  "Priority support"
                ]}
                buttonText="Upgrade Now"
                buttonLink="/signup?plan=pro"
              />
              <PricingPlan
                title="Premium"
                price="$39"
                period="per month"
                features={[
                  "Everything in Pro",
                  "Custom domain",
                  "Team management",
                  "Advanced analytics",
                  "24/7 dedicated support",
                  "API access"
                ]}
                buttonText="Contact Sales"
                buttonLink="/contact"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to transform your coding experience?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
              Join thousands of developers who are already using our collaborative platform.
            </p>
            <Button
              className="bg-green text-black hover:bg-gray-100 px-8 py-6 rounded-xl text-lg inline-flex items-center gap-2"
              asChild
            >
              <Link href="/register">
                Get Started Free <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </PageTransitionWrapper>

  )
}

export default page