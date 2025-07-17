import React from 'react'
import PricingPlan from '@/components/pricingPlan'

export interface SubscriptionPlan {
    name: 'Free' | 'Pro' | 'Team' | 'Enterprise';
    pricePerMonth: number;
    features: string[];
    notAvailable: string[];
}


const Subscription = ({ plan }: { plan: SubscriptionPlan[] }) => {
    return (
        <>
            <section style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="py-5 relative">
                <div className="absolute inset-0 bg-priamry opacity-50"></div>
                <div className="container mx-auto text-white text-center px-4 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-center bg-clip-text">
                        Find Your Perfect Plan
                    </h2>
                    <p className='mt-5'>Flexible plans for coding, collaboration, and execution limits</p>
                    <div className="grid md:grid-cols-3 mt-10 gap-8">
                        {Array.isArray(plan) && plan.length > 0 ? (
                            plan.map((item: SubscriptionPlan, index) => (
                                <PricingPlan
                                    key={index}
                                    title={item.name}
                                    price={`₹ ${item.pricePerMonth}/M`}
                                    popular={false}
                                    features={item.features}
                                    notAvailable={item.notAvailable}
                                    buttonText="Get Started"
                                    buttonLink="/register"
                                />
                            ))
                        ) : (
                            <p>No plans available</p>
                        )}


                    </div>
                </div>
            </section>
        </>
    )
}

export default Subscription