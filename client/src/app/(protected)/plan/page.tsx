import PricingPlan from '@/components/pricingPlan'
import PageTransitionWrapper from '@/components/TransitionWrapper'
import Navbar from '@/components/ui/navbar'
import React from 'react'

const page = () => {
    return (
        <>
            <Navbar />
            <PageTransitionWrapper>
                <section style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="py-5 relative">
                    <div className="absolute inset-0 bg-priamry opacity-50"></div>
                    <div className="container mx-auto text-white text-center px-4 relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-center bg-clip-text">
                            Find Your Perfect Plan
                        </h2>
                        <p className='mt-5'>Flexible plans for coding, collaboration, and execution limits</p>
                        <div className="grid md:grid-cols-3 mt-10 gap-8">
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
            </PageTransitionWrapper>
        </>
    )
}

export default page