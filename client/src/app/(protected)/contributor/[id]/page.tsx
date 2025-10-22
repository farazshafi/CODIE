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
import { getContributerData } from "@/apis/userApi";
import { getContributorDetailsApi, getProjectsDetailsApi, getUsedLanguagesApi } from "@/apis/projectApi";
import { ProfileLanguageStats } from "@/components/profile/ProfileLanguageStats";


const Page = () => {

    const [condributer, setCondributer] = useState({
        name: "",
        avatar: "",
        email: "",
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
    const { id } = useParams()

    const { mutate: getCondributor, } = useMutationHook(getContributerData, {
        onSuccess(res) {
            setCondributer({ name: res.data.name, avatar: res.data.avatar, email: res.data.email })
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



    useEffect(() => {
        getCondributor(id as string)
        getContributorDetails(id as string)
        getProjectsDetails(id as string)
        getUsedLanguage(id as string);
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
                    />

                    {/* Stats Grid */}
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

                    {/* Graph and Projects */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <ContributionGraph />
                        <LatestProjects />
                    </div>
                </div>
            </div>
        </>

    );
};

export default Page;
