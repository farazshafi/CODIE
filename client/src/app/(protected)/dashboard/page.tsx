"use client";
import Navbar from "@/components/ui/navbar";
import { FilePlus, HousePlus, Rocket } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard/SpotlightCard";
import ProjectCard from "@/components/projectCard";
import Link from "next/link";
import PageTransitionWrapper from "@/components/TransitionWrapper";
import CreateProjectModal from "./_component/CreateProjectModal";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { ProjectCardType } from "@/types";
import { toast } from "sonner";
import ProjectCardSkeleton from "./_component/ProjectCardSkelton";
import SectionTitle from "./_component/SectionTitle";
import { useSocket } from "@/context/SocketContext";
import { getProjectsByUserIdApi, getContributedProjectsApi } from "@/apis/projectApi";

export type NavbarRef = {
    updateNotificationData: () => void;
}

export default function Home() {

    const user = useUserStore((state) => state.user);
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { socket } = useSocket()
    const userId = user?.id;
    const userSubscription = useUserStore((state) => state.subscription)
    const navbarRef = useRef<NavbarRef>(null);

    const [projects, setProjects] = useState<ProjectCardType[]>([]);
    const [loading, setLoading] = useState(false);

    const [contributedProjectsList, setContributedProjectsList] = useState<ProjectCardType[]>([]);
    const [contributedLoading, setContributedLoading] = useState(false);

    const fetchProjects = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const response = await getProjectsByUserIdApi();
            setProjects(response?.data?.projects || response?.data || []);
        } catch (err) {
            console.error("Error fetching projects:", err);
            toast.error("Failed to load projects. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchContributedProjects = useCallback(async () => {
        if (!userId) return;
        try {
            setContributedLoading(true);
            const response = await getContributedProjectsApi(userId);
            setContributedProjectsList(response?.data || []);
        } catch (err) {
            console.error("Error fetching contributed projects:", err);
            toast.error("Failed to load contributed projects. Please try again later.");
        } finally {
            setContributedLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!user?.token) {
            setIsRedirecting(true);
            router.push("/login");
        }
    }, [user, router]);

    useEffect(() => {
        fetchProjects();
        fetchContributedProjects();
    }, [fetchProjects, fetchContributedProjects]);

    useEffect(() => {
        if (!socket) return;
        const handleInvitationAccepted = () => {
            fetchContributedProjects();
            if (navbarRef.current) {
                navbarRef.current.updateNotificationData();
            }
        };

        const handleSocketError = (error: string) => {
            console.log("error in socket", error);
            toast.error(error || "Socket Error");
        };

        socket.on("invitation-accepted-success", handleInvitationAccepted);
        socket.on("error", handleSocketError);

        return () => {
            socket.off("invitation-accepted-success", handleInvitationAccepted);
            socket.off("error", handleSocketError);
        };
    }, [socket, fetchContributedProjects]);

    if (isRedirecting) {
        return <Loading fullScreen text="Redirecting to Login page" />;
    }

    return (
        <div>
            <Navbar ref={navbarRef} refetchProjects={fetchContributedProjects} />
            <PageTransitionWrapper>
                <div className="px-5 py-6">

                    {/* Action Buttons */}
                    <div className="flex flex-row justify-center gap-4 sm:gap-6">
                        {
                            userSubscription && projects.length < userSubscription?.maxPrivateProjects ? (
                                <CreateProjectModal
                                    refetchProject={fetchProjects}
                                    title="Create a project"
                                    subtitle="Please enter the details below"
                                    language={true}
                                    trigger={
                                        <div>
                                            <SpotlightCard
                                                className="cursor-pointer custom-spotlight-card w-[120px] sm:w-[250px] h-[90px] sm:h-[140px] text-white p-3 flex items-center justify-center transform transition-transform duration-300 hover:scale-105"
                                                spotlightColor="rgba(255, 255, 255, 0.4)"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <FilePlus className="hidden sm:block w-12 h-12" />

                                                    <p className="text-center text-sm sm:text-base">
                                                        Create Project
                                                    </p>
                                                </div>
                                            </SpotlightCard>
                                        </div>
                                    }
                                />
                            ) : (
                                <div className="w-[100px] sm:w-[250px] text-white p-2 bg-gray-700 opacity-50 rounded-md cursor-not-allowed">
                                    <div className="flex flex-col items-center justify-center">
                                        <HousePlus className="hidden sm:block w-12 h-12" />
                                        <p className="text-center text-sm sm:text-base">
                                            Create project
                                        </p>
                                    </div>
                                </div>
                            )
                        }

                        <CreateProjectModal title="Join a room" language={false} trigger={<div >
                            <SpotlightCard className="cursor-pointer custom-spotlight-card w-[120px] sm:w-[250px] h-[90px] sm:h-[140px] text-white p-3 flex items-center justify-center transform transition-transform duration-300 hover:scale-105"
                                spotlightColor="rgba(255, 255, 255, 0.4)" >
                                <div className="flex flex-col items-center justify-center">
                                    <HousePlus className="hidden sm:block w-12 h-12" />
                                    <p className="text-center text-xs sm:text-base mt-2">Join Room</p>
                                </div>
                            </SpotlightCard>
                        </div >} />
                        <Link href="/discover">
                            <SpotlightCard
                                className="cursor-pointer custom-spotlight-card w-[120px] sm:w-[250px] h-[90px] sm:h-[140px] text-white p-3 flex items-center justify-center transform transition-transform duration-300 hover:scale-105"
                                spotlightColor="rgba(255, 255, 255, 0.4)"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <Rocket className="hidden sm:block w-12 h-12" />
                                    <p className="text-center text-sm sm:text-base">
                                        Discover Snippets
                                    </p>
                                </div>
                            </SpotlightCard>
                        </Link>
                    </div>

                    <SectionTitle title="My Projects" tagColor="bg-black" />

                    {projects.length < 1 && (
                        <div className="px-6 py-3">
                            <div className="w-full bg-tertiary rounded-md text-center py-10 outline-dashed">
                                <p className="text-sm sm:text-lg md:text-xl text-white">
                                    No Projects Found!. Create First Project
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Project Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-5">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <ProjectCardSkeleton key={index} />
                            ))
                        ) : (
                            projects.map((project: ProjectCardType, index: number) => (
                                <ProjectCard
                                    isContributer={false}
                                    key={project.id || index}
                                    refetchProject={fetchProjects}
                                    title={project.projectName}
                                    language={project.projectLanguage}
                                    codePreview={project.codePreview}
                                    projectCode={project.projectCode}
                                    id={project._id ? project._id : project.id}
                                    updatedAt={project.updatedAt ? new Date(isNaN(Number(project.updatedAt)) ? project.updatedAt : Number(project.updatedAt)).toLocaleTimeString() : ""}
                                />
                            ))
                        )}
                    </div>

                    <SectionTitle title="Contributed proejcts" tagColor="bg-white" />

                    {contributedProjectsList.length < 1 && (
                        <div className="text-center mx-3 mt-5">
                            <p className="text-sm sm:text-lg md:text-xl text-white outline-dashed px-4 py-2">You Never did Contribution to any project!</p>
                        </div>
                    )}

                    {/* contributed Projects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-5">
                        {contributedLoading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <ProjectCardSkeleton key={index} />
                            ))
                        ) : (
                            contributedProjectsList.map((project: ProjectCardType, index: number) => (
                                <ProjectCard
                                    key={project.id || index}
                                    refetchProject={fetchContributedProjects}
                                    title={project.projectName}
                                    language={project.projectLanguage}
                                    codePreview={project.codePreview}
                                    projectCode={project.projectCode}
                                    id={project.id}
                                    isContributer={true}
                                    updatedAt={project.updatedAt ? new Date(isNaN(Number(project.updatedAt)) ? project.updatedAt : Number(project.updatedAt)).toLocaleTimeString() : ""}
                                />
                            ))
                        )}
                    </div>

                </div>
            </PageTransitionWrapper>
        </div>
    );
}
