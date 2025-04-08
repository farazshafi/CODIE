
import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, Code, Star, GitBranch, ArrowUpRight } from "lucide-react";

export const ProfileActivity = () => {
    const activities = [
        {
            id: 1,
            type: "code",
            title: "Created a new snippet",
            snippet: "React Authentication Hook",
            time: "2 hours ago",
            icon: <Code size={16} />,
        },
        {
            id: 2,
            type: "star",
            title: "Starred a snippet",
            snippet: "Vue.js Animation Components",
            time: "Yesterday",
            icon: <Star size={16} />,
        },
        {
            id: 3,
            type: "fork",
            title: "Forked a project",
            snippet: "JavaScript Data Structures",
            time: "3 days ago",
            icon: <GitBranch size={16} />,
        },
        {
            id: 4,
            type: "code",
            title: "Updated a snippet",
            snippet: "CSS Grid Layout Helper",
            time: "1 week ago",
            icon: <Code size={16} />,
        },
    ];

    const getActivityColor = (type: string) => {
        switch (type) {
            case "code":
                return "bg-blue-500/20 text-blue-400";
            case "star":
                return "bg-yellow-500/20 text-yellow-400";
            case "fork":
                return "bg-purple-500/20 text-purple-400";
            default:
                return "bg-gray-500/20 text-gray-400";
        }
    };

    return (
        <Card className="border-none bg-code-card bg-opacity-30 p-5 rounded-xl animate-fade-in">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <button className="text-code-green text-sm flex items-center gap-1 hover:underline">
                    View All <ArrowUpRight size={14} />
                </button>
            </div>

            <div className="space-y-5">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 group">
                        <div className={`p-2 rounded-lg h-fit ${getActivityColor(activity.type)}`}>
                            {activity.icon}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-white">{activity.title}</h3>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <Clock size={14} className="mr-1" />
                                    {activity.time}
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mt-1">{activity.snippet}</p>

                            <div className="h-[1px] bg-gradient-to-r from-code-green/20 via-gray-700/20 to-transparent mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};