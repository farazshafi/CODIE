
import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Language {
    name: string;
    count: number;
}

interface ProfileLanguageStatsProps {
    languages: Language[];
}

export const ProfileLanguageStats: React.FC<ProfileLanguageStatsProps> = ({ languages }) => {
    const totalCount = languages.reduce((acc, lang) => acc + lang.count, 0);

    const getLanguageColor = (language: string) => {
        const colors: Record<string, string> = {
            JavaScript: "#f7df1e",
            TypeScript: "#3178c6",
            Python: "#3776ab",
            Java: "#b07219",
            "C++": "#f34b7d",
            Ruby: "#701516",
            Go: "#00ADD8",
            Rust: "#dea584",
            PHP: "#4F5D95",
            Swift: "#F05138",
        };

        return colors[language] || "#4ADE80";
    };

    return (
        <PageTransitionWrapper animation="slide">
            <Card className="px-3 card-stats border-none overflow-hidden relative group">
                <div className="absolute  bg-gradient-to-br from-slate-800 to-black rounded-xl" />

                <div className="flex items-center justify-between">
                    <h3 className="text-gray-500 text-sm">Preferred Languages</h3>
                    <div className="p-2 rounded-lg bg-black">
                        <Globe className="mygreen" size={18} />
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    {languages.map((lang) => (
                        <div key={lang.name} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-black">{lang.name}</span>
                                <span className="mygreen">{lang.count}</span>
                            </div>
                            <Progress
                                value={(lang.count / totalCount) * 100}
                                className="h-1.5 border-black"
                            />
                        </div>
                    ))}
                </div>
            </Card>
        </PageTransitionWrapper>

    );
};

// Import the necessary icon
import { Globe } from "lucide-react";
import PageTransitionWrapper from "../TransitionWrapper";
