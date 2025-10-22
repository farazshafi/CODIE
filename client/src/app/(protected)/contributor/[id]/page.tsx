"use client"
import { FolderGit2, GitCommit } from "lucide-react";
import { ContributorProfile } from "../_components/ContributerProfile";
import { StatsCard } from "../_components/StatusCard";
import { ContributionGraph } from "../_components/ContributionGraph";
import { LatestProjects } from "../_components/LatestProjects";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/navbar";
import { useParams } from "next/navigation";
import { useMutationHook } from "@/hooks/useMutationHook";
import { getContributerData, getProfileVisibilityApi } from "@/apis/userApi";
import { getContributorDetailsApi, getProjectsDetailsApi, getUsedLanguagesApi } from "@/apis/projectApi";
import { ProfileLanguageStats } from "@/components/profile/ProfileLanguageStats";


const Page = () => {

    const [condributer, setCondributer] = useState({
        name: "",
        avatar: "",
        email: "",
        portfolio: "",
        github: "",
    })
    const [usedLanguages, setUsedLanguages] = useState<{ name: string; count: number }[]>([]);
    const [contributedProjectsDetails, setContributedProjectsDetails] = useState({
        isPositive: false,
        value: 0,
        projects: []
    })
    const [projectsDetails, setProjectsDetails] = useState({
        isPositive: false,
        value: 0,
        projects: []
    })
    const [visibility, setVisibility] = useState(true)
    const { id } = useParams()

    const { mutate: getCondributor, } = useMutationHook(getContributerData, {
        onSuccess(res) {
            setCondributer({ name: res.data.name, avatar: res.data.avatar, email: res.data.email, portfolio: res.data.portfolio || "", github: res.data.github || "" })
        }
    })

    const { mutate: getContributorDetails } = useMutationHook(getContributorDetailsApi, {
        onSuccess(res) {
            console.log("contribution details", res.data)
            setContributedProjectsDetails({
                projects: res.data.projects,
                isPositive: res.data.isPositive,
                value: res.data.percentage
            })
        }
    })

    const { mutate: getProjectsDetails } = useMutationHook(getProjectsDetailsApi, {
        onSuccess(res) {
            console.log("contribution details", res.data)
            setProjectsDetails({
                projects: res.data.projects,
                isPositive: res.data.isPositive,
                value: res.data.percentage
            })
        }
    })

    const { mutate: getUsedLanguage } = useMutationHook(getUsedLanguagesApi, {
        onSuccess(data) {
            console.log("used langes data", data.data)
            setUsedLanguages(data.data);
        },
    });

    const { mutate: getVisibility } = useMutationHook(getProfileVisibilityApi, {
        onSuccess(data) {
            console.log("used langes data", data.data)
            setVisibility(data.data.isVisible)
        },
    });



    useEffect(() => {
        getCondributor(id as string)
        getContributorDetails(id as string)
        getProjectsDetails(id as string)
        getUsedLanguage(id as string);
        getVisibility(id as string)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Navbar />
            <div className="min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white sm:text-4xl">
                            Contributor Profile
                        </h1>
                        <p className="text-muted">
                            Track your contributions and project involvement
                        </p>
                    </div>

                    {/* Profile Section */}
                    <ContributorProfile
                        name={condributer.name}
                        email={condributer.email}
                        avatar={condributer.avatar}
                        portfolio={condributer?.portfolio.length > 1 ? condributer.portfolio : null}
                        github={condributer?.github.length > 1 ? condributer.github : null}
                    />

                    {!visibility ? (
                        <div className="mt-6 p-6 bg-gray-800 rounded-lg text-center text-white">
                            This profile is private. Contributions and projects are hidden.
                        </div>
                    ) : (
                        <div className={visibility ? "space-y-6" : "space-y-6 opacity-30 pointer-events-none"}>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <StatsCard
                                    title="Total Projects"
                                    value={projectsDetails.projects.length}
                                    icon={FolderGit2}
                                    trend={{ value: projectsDetails.value, positive: projectsDetails.isPositive }}
                                />
                                <StatsCard
                                    title="Total Contributions"
                                    value={contributedProjectsDetails.projects.length}
                                    icon={GitCommit}
                                    trend={{ value: contributedProjectsDetails.value, positive: contributedProjectsDetails.isPositive }}
                                />
                                {usedLanguages.length > 0 && <ProfileLanguageStats languages={usedLanguages} />}
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                {id && <ContributionGraph id={id as string} />}
                                <LatestProjects />
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </>
    );
};

export default Page;
