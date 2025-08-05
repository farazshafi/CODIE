"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import PaymentButton from "./PaymentButton";
import { useUserStore } from "@/stores/userStore";

interface PricingPlanProps {
    title: string;
    price: number;
    period?: string;
    features: string[];
    notAvailable: string[];
    planId: string;
}

const PricingPlan = ({
    title,
    price,
    period,
    features,
    planId,
    notAvailable,
}: PricingPlanProps) => {
    const userSubscription = useUserStore((state) => state.subscription)

    const isCurrentPlan = planId === userSubscription?.id

    return (
        <div className={`relative rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105`}>
            {isCurrentPlan && (
                <div className="absolute top-0 left-0 right-0 py-2 text-center bg-gradient-to-r from-green-500 to-green-700 text-white font-bold">
                    Current Plan
                </div>
            )}
            {userSubscription?.nextPlanId && userSubscription.nextPlanId === planId && (
                <div className="absolute top-0 left-0 right-0 py-2 text-center bg-gradient-to-r from-gray-500 to-white text-black font-bold">
                    Pre paid Next plan
                </div>
            )}
            <div className={`h-full flex flex-col p-8 pb-14 ${isCurrentPlan ? 'bg-gradient-to-b from-black to-green-950' : 'bg-black'} border ${isCurrentPlan ? 'border-green-500/30' : 'border-gray-800'}`}>
                <div className="mb-8">
                    <div className={`flex items-end gap-1 ${isCurrentPlan ? "mt-5" : userSubscription?.nextPlanId === planId ? "mt-5" : ""}`}>
                        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold text-white">Rs.{price}/ <span className="text-3xl text-gray-500">m</span> </span>
                        {period && (
                            <span className="text-gray-400 mb-1">{period}</span>
                        )}
                    </div>
                </div>

                <ul className="flex-grow">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start mb-4">
                            <span className="mr-2 mt-1 text-green-400">
                                <Check size={16} />
                            </span>
                            <span className="text-gray-300">{feature}</span>
                        </li>
                    ))}
                </ul>

                <ul className="mb-8 flex-grow">
                    {notAvailable.map((item, index) => (
                        <li key={index} className="flex items-start mb-4">
                            <span className="mr-2 mt-1 text-red-500">
                                <X size={16} />
                            </span>
                            <span className="text-gray-300">{item}</span>
                        </li>
                    ))}
                </ul>

                <Button
                    className={`mt-auto w-full py-6 ${isCurrentPlan
                        ? 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                    asChild
                >
                    <PaymentButton planName={title} planId={planId} amount={price} currency="INR" />
                </Button>
            </div>
        </div>
    );
};

export default PricingPlan;