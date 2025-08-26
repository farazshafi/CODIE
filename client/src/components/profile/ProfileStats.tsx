import React from "react";
import { Card } from "@/components/ui/card";
import PageTransitionWrapper from "../TransitionWrapper";

interface ProfileStatsProps {
    icon: React.ReactNode;
    title: string;
    value?: number | string;
    totalContributedProjects?: number;
    totalProjects?: number;
    totalAiUsage?: number;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
    icon,
    title,
    value,
    totalContributedProjects,
    totalProjects,
    totalAiUsage
}) => {
    return (
        <Card
            className="
                card-stats 
                px-4 py-3 
                border-none 
                overflow-hidden 
                relative 
                group 
                transform 
                transition 
                duration-300 
                ease-in-out 
                hover:scale-[1.03] 
               bg-tertiary
                text-white 
                rounded-xl 
                shadow-lg
            "
        >
            <PageTransitionWrapper animation="slide">

                <div className="flex items-center justify-between">
                    <h3 className="text-gray-400 text-sm">{title}</h3>
                    <div className="p-2 rounded-lg bg-black bg-opacity-40">{icon}</div>
                </div>

                <div className="mt-2">
                    {title === "Projects" ? (
                        <div className="flex flex-col gap-y-3">
                            <div className="w-full p-2 rounded-md flex justify-between border-2">
                                <p className="text-sm">Total contributions</p>
                                <p className="text-sm">{totalContributedProjects}</p>
                            </div>
                            <div className="w-full p-2 rounded-md flex justify-between border-2">
                                <p className="text-sm">Total Projects</p>
                                <p>{totalProjects}</p>
                            </div>
                            <div className="w-full p-2 rounded-md flex justify-between border-2">
                                <p className="text-sm">Total Ai Usage</p>
                                <p>{totalAiUsage}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-3xl font-bold text-white">{value}</p>
                    )}
                </div>
            </PageTransitionWrapper>
        </Card>

    );
};
