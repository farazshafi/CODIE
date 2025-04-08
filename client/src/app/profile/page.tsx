
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GithubIcon, Code, Terminal, Globe } from "lucide-react";
import { ProfileLanguageStats } from "@/components/profile/ProfileLanguageStats";
import { ProfileActivity } from "@/components/profile/ProfileActivity";
import { ProfileStats } from "@/components/profile/ProfileStats";
import Navbar from "@/components/ui/navbar";
import PageTransitionWrapper from "@/components/TransitionWrapper";

const page = () => {
    const user = {
        name: "Faraz Shafi",
        email: "farazshafi77@gmail.com",
        avatar: "/lovable-uploads/9c807686-6dbf-4b02-9987-75e3350ca9a8.png",
        status: "Online",
        stats: {
            totalCodeRuns: 20,
            codeExecutions: 18,
            averageRuntime: "1.2s",
            starredSnippets: 15,
            mostStarred: 8,
            languages: [
                { name: "JavaScript", count: 12 },
                { name: "Python", count: 5 },
                { name: "TypeScript", count: 3 },
            ],
        },
    };

    return (
        <>
            <Navbar />
            <PageTransitionWrapper>
                <div className="min-h-screen bg-primary p-4 sm:p-8 animate-fade-in">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-scale-in">
                                <Avatar className="h-24 w-24 ring-2 hover-scale">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-green text-black font-bold text-xl">
                                        {user.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                                        <Badge className="bg-green text-black ml-2">{user.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                                        <p>{user.email}</p>
                                    </div>
                                    {/* <div className="flex mt-3 gap-2">
                                    <Badge variant="outline" className="flex bg-black items-center gap-1 hover-scale">
                                        <GithubIcon className="text-white" size={14} />
                                        <span className="text-white">GitHub</span>
                                    </Badge>
                                    <Badge variant="outline" className="flex bg-black items-center gap-1 hover-scale">
                                        <Globe className="text-white" size={14} />
                                        <span className="text-white">Portfolio</span>
                                    </Badge>
                                </div> */}
                                </div>
                            </div>

                            <button className="px-4 py-2 rounded-lg bg-green text-black font-medium hover:bg-green-dark transition-colors duration-300 animate-scale-in">
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <ProfileStats
                                icon={<Terminal className="mygreen" />}
                                title="Total Code Runs"
                                value={user.stats.totalCodeRuns}
                                description="Code Executions"
                                subValue={user.stats.codeExecutions}
                            />

                            <ProfileStats
                                icon={<Code className="mygreen" />}
                                title="Starred Snippets"
                                value={user.stats.starredSnippets}
                                description="Most Starred"
                                subValue={user.stats.mostStarred}
                            />

                            <ProfileLanguageStats languages={user.stats.languages} />
                        </div>

                        <ProfileActivity />
                    </div>
                </div>
            </PageTransitionWrapper>

        </>
    );
};

export default page;
