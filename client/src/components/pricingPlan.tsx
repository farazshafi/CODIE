
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

interface PricingPlanProps {
    title: string;
    price: string;
    period?: string;
    features: string[];
    buttonText: string;
    buttonLink: string;
    popular?: boolean;
}

const PricingPlan = ({
    title,
    price,
    period,
    features,
    buttonText,
    buttonLink,
    popular = false,
}: PricingPlanProps) => {
    return (
        <div className={`relative rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 ${popular ? 'transform scale-105 z-10' : ''}`}>
            {popular && (
                <div className="absolute top-0 left-0 right-0 py-2 text-center bg-gradient-to-r from-green-500 to-green-700 text-white font-bold">
                    Most Popular
                </div>
            )}
            <div className={`h-full flex flex-col p-8 ${popular ? 'bg-gradient-to-b from-black to-green-950 pt-14' : 'bg-black'} border ${popular ? 'border-green-500/30' : 'border-gray-800'}`}>
                <div className="mb-8">
                    <div className="flex items-end gap-1">
                        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold text-white">{price}</span>
                        {period && (
                            <span className="text-gray-400 mb-1">{period}</span>
                        )}
                    </div>
                </div>

                <ul className="mb-8 flex-grow">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start mb-4">
                            <span className="mr-2 mt-1 text-green-400">
                                <Check size={16} />
                            </span>
                            <span className="text-gray-300">{feature}</span>
                        </li>
                    ))}
                </ul>

                <Button
                    className={`mt-auto w-full py-6 ${popular
                        ? 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                    asChild
                >
                    <Link href={buttonLink}>{buttonText}</Link>
                </Button>
            </div>
        </div>
    );
};

export default PricingPlan;