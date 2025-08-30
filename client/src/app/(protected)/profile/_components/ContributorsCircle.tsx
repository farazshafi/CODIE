"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutationHook } from "@/hooks/useMutationHook";
import { getAllContributersForUserApi } from "@/apis/roomApi";

interface Contributor {
  id: string;
  name: string;
  avatar?: string;
  contributions: number;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}

export default function ContributorsCircle() {
  const [contributors, setContributors] = useState<Contributor[]>([]);

  const { mutate: getContributors } = useMutationHook(getAllContributersForUserApi, {
    onSuccess(data) {
      // Sort by contributions descending
      const sorted = data.sort((a: Contributor, b: Contributor) => b.contributions - a.contributions);
      setContributors(sorted);
    },
  });

  useEffect(() => {
    getContributors();
  }, []);

  return (
    <TooltipProvider>
      <div className="flex gap-4 p-6 rounded-xl shadow-lg bg-white ">
        {contributors.length < 1 && <><p>There is no Contributers</p></>}
        {contributors.map((contributor) => (
          <Tooltip key={contributor.id}>
            <TooltipTrigger asChild>
              <div className="relative group">
                {contributor.avatar ? (
                  <Image
                    src={contributor.avatar}
                    alt={contributor.name}
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-green-500 hover:scale-110 transition-transform cursor-pointer"
                  />
                ) : (
                  <div className="w-[60px] h-[60px] flex items-center justify-center rounded-full border-2 border-green-500 bg-gray-700 text-green-400 font-semibold hover:scale-110 transition-transform cursor-pointer">
                    {getInitials(contributor.name)}
                  </div>
                )}
                {/* Badge for contribution count */}
                <span className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                  {contributor.totalContributions}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-green-400 border border-green-500 shadow-md">
              <p className="font-semibold">{contributor.name}</p>
              <p>Contributed {contributor.totalContributions} times</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
