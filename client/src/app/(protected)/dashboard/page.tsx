"use client";
import Navbar from "@/components/ui/navbar";
import { FilePlus, HousePlus, Rocket } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard/SpotlightCard";
import ProjectCard from "@/components/projectCard";
import Link from "next/link";
import PageTransitionWrapper from "@/components/TransitionWrapper";
import CreateProjectModal from "./_component/CreateProjectModal";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useQuery } from "@apollo/client";
import { GET_CONTRIBUTED_PROJECTS_BY_USER_ID, GET_PROJECTS_BY_USER_ID } from "@/graphql/queries/projectQueries";
import { ProjectCardType } from "@/types";
import { toast } from "sonner";
import ProjectCardSkeleton from "./_component/ProjectCardSkelton";
import SectionTitle from "./_component/SectionTitle";
import { useSocket } from "@/context/SocketContext";

export default function Home() {

    const user = useUserStore((state) => state.user);
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { socket } = useSocket()
    const userId = user?.id;
    const navbarRef = useRef<any>(null);


    const { data, loading, error, refetch } = useQuery(GET_PROJECTS_BY_USER_ID, {
        variables: { userId },
    });

    const { data: contributedProjects, loading: contributedLoading, error: contributeError, refetch: refetchContributedProject } = useQuery(GET_CONTRIBUTED_PROJECTS_BY_USER_ID, {
        variables: { userId },
    });

    useEffect(() => {
        if (!user?.token) {
            setIsRedirecting(true);
            router.push("/login");
        }
    }, [user, router]);


    useEffect(() => {
        if (error || contributeError) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to load projects. Please try again later.");
        }
    }, [error, contributeError]);

    useEffect(() => {
        if (!socket) return
        const fetchProjects = () => {
            refetchContributedProject()
            if (navbarRef.current) {
                navbarRef.current.updateNotificationData()
            }
        }

        const handleSocketError = (error: string) => {
            console.log("error in socket", error)
            toast.error(error || "Socket Error")
        }

        socket.on("invitation-accepted-success", fetchProjects)
        socket.on("error", handleSocketError)

        return () => {
            socket.off("invitation-accepted-success", fetchProjects)
            socket.off("error", handleSocketError)

        }
    }, [socket, refetchContributedProject])

    if (isRedirecting) {
        return <Loading fullScreen text="Redirecting to Login page" />;
    }

    return (
        <div>
            <Navbar ref={navbarRef} refetchProjects={refetchContributedProject} />
            <PageTransitionWrapper>
                <div className="px-10 py-6">

                    {/* Action Buttons */}
                    <div className="flex flex-row justify-center gap-10">
                        <CreateProjectModal refetchProject={refetch} title="Create a project" subtitle="Please enter the details below" language={true} trigger={<div> <SpotlightCard className=" cursor-pointer custom-spotlight-card w-[100px] sm:w-[250px] text-white p-2 transform transition-transform duration-300 hover:scale-105 " spotlightColor="rgba(255, 255, 255, 0.4)" > <div className="flex flex-col items-center justify-center"> <FilePlus className="w-6 h-6 sm:w-12 sm:h-12" /> <p className="text-center text-xs sm:text-base mt-2">Create Project</p> </div> </SpotlightCard> </div>} />
                        <CreateProjectModal title="Join a room" language={false} trigger={<div > <SpotlightCard className=" cursor-pointer custom-spotlight-card w-[100px] sm:w-[250px] text-white p-2 transform transition-transform duration-300 hover:scale-105 " spotlightColor="rgba(255, 255, 255, 0.4)" > <div className="flex flex-col items-center justify-center"> <HousePlus className="w-6 h-6 sm:w-12 sm:h-12" /> <p className="text-center text-xs sm:text-base mt-2">Join Room</p> </div> </SpotlightCard> </div >} />
                        <Link href="/discover">
                            <SpotlightCard
                                className="cursor-pointer custom-spotlight-card w-[100px] sm:w-[250px] text-white p-2 transform transition-transform duration-300 hover:scale-105"
                                spotlightColor="rgba(255, 255, 255, 0.4)"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <Rocket className="w-6 h-6 sm:w-12 sm:h-12" />
                                    <p className="text-center text-xs sm:text-base mt-2">Discover Snippets</p>
                                </div>
                            </SpotlightCard>
                        </Link>
                    </div>

                    <SectionTitle title="My Projects" tagColor="bg-black" />

                    {data?.getProjectsByUserId?.length < 1 && (
                        <div className="px-6 py-3">
                            <div className="w-full bg-tertiary rounded-md text-center py-10 outline-dashed">
                                <p className="text-xl text-white">No Projects Found!. Create First Project</p>
                            </div>
                        </div>
                    )}

                    {/* Project Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-5">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <ProjectCardSkeleton key={index} />
                            ))
                        ) : data?.getProjectsByUserId?.length > 0 && (
                            data.getProjectsByUserId.map((project: ProjectCardType, index: number) => (
                                <ProjectCard
                                    key={index}
                                    refetchProject={refetch}
                                    title={project.projectName}
                                    language={project.projectLanguage}
                                    id={project.id}
                                    updatedAt={new Date(Number(project.updatedAt)).toLocaleTimeString()}
                                />
                            ))
                        )}
                    </div>

                    <SectionTitle title="Contributed proejcts" tagColor="bg-white" />

                    {contributedProjects?.getContributedProjectsByUserId?.length < 1 && (
                        <div className="text-center mx-3 mt-5">
                            <p className="text-lg text-white outline-dashed px-4 py-2">You Never did Contribution to any project!</p>
                        </div>
                    )}

                    {/* contributed Projects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-5">
                        {contributedLoading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <ProjectCardSkeleton key={index} />
                            ))
                        ) : contributedProjects?.getContributedProjectsByUserId?.length > 0 && (
                            contributedProjects.getContributedProjectsByUserId.map((project: ProjectCardType, index: number) => (
                                <ProjectCard
                                    key={index}
                                    refetchProject={refetchContributedProject}
                                    title={project.projectName}
                                    language={project.projectLanguage}
                                    id={project.id}
                                    isContributer={true}
                                    updatedAt={new Date(Number(project.updatedAt)).toLocaleTimeString()}
                                />
                            ))
                        )}
                    </div>

                </div>
            </PageTransitionWrapper>
        </div>
    );
}
