import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Star } from "lucide-react";
import { useMutationHook } from "@/hooks/useMutationHook";
import { getRecentContributionProjectsApi } from "@/apis/roomApi";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Project {
    id: number;
    name: string;
    contributions: number;
    language: string;
    stars: number;
}

export const LatestProjects = () => {

    const { id } = useParams()
    const [recentProject, setRecentProject] = useState<Project[]>([])


    const { mutate: recentProjects } = useMutationHook(getRecentContributionProjectsApi, {
        onSuccess(data) {
            console.log("used langes data", data.data)
            setRecentProject(data.data)
        },
    });

    useEffect(() => {
        recentProjects(id as string)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Card className="bg-tertiary">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                    Latest Contributed Projects
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentProject.map((project,i) => (
                    <div
                        key={i}
                        className="group rounded-lg border border-border bg-secondary/50 p-4 transition-all duration-300 hover:border-primary/50 hover:bg-secondary"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 space-y-2">
                                <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                                    {project.name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-green-600 text-white">
                                        {project.language}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-sm text-muted-white">
                                        <GitBranch className="h-3 w-3" />
                                        <span>{project.contributions} contributorss</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-white">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span>{project.stars}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
