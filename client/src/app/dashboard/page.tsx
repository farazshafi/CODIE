"use client";
import Navbar from "@/components/ui/navbar";
import { FilePlus, HousePlus, Rocket } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard/SpotlightCard";
import ProjectCard from "@/components/projectCard";
import Link from "next/link";
import PageTransitionWrapper from "@/components/TransitionWrapper";
import CreateProjectModal from "./_component/CreateProjectModal";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function Home() {

    const user = useUserStore((state) => state.user)
    const router = useRouter()
    const [isRedirecting, setIsRedirecting] = useState(false)

    useEffect(() => {
        setIsRedirecting(true);
        if (!user || !user.token) {
            router.push("/login");
        } else {
            setIsRedirecting(false);
        }
    }, [user])

    if (isRedirecting) {
        return <Loading fullScreen text="Redirecting to Login page" />
    }

    return (
        <div>
            <Navbar />
            <PageTransitionWrapper>
                <div className="px-10 py-6">

                    <div className="flex flex-row justify-center gap-10">
                        <CreateProjectModal
                            title="Create a project"
                            subtitle="Please enter the details below"
                            language={true}
                            trigger={
                                <div>
                                    <SpotlightCard
                                        className="
cursor-pointer 
custom-spotlight-card 
w-[100px] sm:w-[250px] 
text-white p-2 
transform 
transition-transform 
duration-300 
hover:scale-105
"
                                        spotlightColor="rgba(255, 255, 255, 0.4)"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <FilePlus className="w-6 h-6 sm:w-12 sm:h-12" />
                                            <p className="text-center text-xs sm:text-base mt-2">Create Project</p>
                                        </div>
                                    </SpotlightCard>
                                </div>
                            }
                        />

                        <CreateProjectModal
                            title="Join a room"
                            subtitle="Enter the room name to join"
                            language={false}
                            trigger={
                                <div >
                                    <SpotlightCard
                                        className="
                             cursor-pointer 
                             custom-spotlight-card 
                             w-[100px] sm:w-[250px] 
                             text-white p-2 
                             transform 
                             transition-transform 
                             duration-300 
                             hover:scale-105
                            "
                                        spotlightColor="rgba(255, 255, 255, 0.4)"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <HousePlus className="w-6 h-6 sm:w-12 sm:h-12" />
                                            <p className="text-center text-xs sm:text-base mt-2">Join Room</p>
                                        </div>
                                    </SpotlightCard>
                                </div >
                            }
                        />

                        <Link href={"/discover"}>
                            <SpotlightCard
                                className="
                                 cursor-pointer 
                                 custom-spotlight-card 
                                 w-[100px] sm:w-[250px] 
                                 text-white p-2 
                                 transform 
                                 transition-transform 
                                 duration-300 
                                 hover:scale-105
                               "
                                spotlightColor="rgba(255, 255, 255, 0.4)"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <Rocket className="w-6 h-6 sm:w-12 sm:h-12" />
                                    <p className="text-center text-xs sm:text-base mt-2">Discover Snippets</p>
                                </div>
                            </SpotlightCard>
                        </Link>
                    </div>
                    <div className=" flex flex-row mt-10 items-center">
                        <p className="text-white text-lg">Recent</p>
                        <div className="h-[3px] bg-gray-700 w-full ml-5"></div>
                    </div>

                    {/* card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
                        <ProjectCard />
                        <ProjectCard />
                        <ProjectCard />
                        <ProjectCard />
                        <ProjectCard />
                        <ProjectCard />
                    </div>
                </div>
            </PageTransitionWrapper>
        </div >

    );
}
