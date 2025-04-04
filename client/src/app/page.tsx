"use client";
import Navbar from "@/components/ui/navbar";
import { FilePlus, HousePlus, Rocket } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard/SpotlightCard";
import ProjectCard from "@/components/projectCard";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="px-10 py-6">

        <div className="flex flex-row justify-center gap-10">
          <SpotlightCard
            className="cursor-pointer custom-spotlight-card w-[100px] sm:w-[250px] text-white p-2"
            spotlightColor="rgba(27, 240, 124, 0.3)"
          >
            <div className="flex flex-col items-center justify-center">
              <FilePlus className="w-6 h-6 sm:w-12 sm:h-12" />
              <p className="text-center text-xs sm:text-base mt-2">Create Project</p>
            </div>
          </SpotlightCard>

          <SpotlightCard
            className="cursor-pointer custom-spotlight-card w-[100px] sm:w-[250px] bg-white text-black p-2"
            spotlightColor="rgba(31, 33, 37, 0.3)"
          >
            <div className="flex flex-col items-center justify-center">
              <HousePlus className="w-6 h-6 sm:w-12 sm:h-12" />
              <p className="text-center text-xs sm:text-base mt-2">Join Room</p>
            </div>
          </SpotlightCard>

          <SpotlightCard
            className="cursor-pointer custom-spotlight-card w-[100px] sm:w-[250px] bg-discover text-white p-2"
            spotlightColor="rgba(255, 255, 255, 0.4)"
          >
            <div className="flex flex-col items-center justify-center">
              <Rocket className="w-6 h-6 sm:w-12 sm:h-12" />
              <p className="text-center text-xs sm:text-base mt-2">Discover Snippets</p>
            </div>
          </SpotlightCard>
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
    </div >
  );
}
