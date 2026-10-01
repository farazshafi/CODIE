"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GithubIcon, Code, Terminal, Globe, PenLine } from "lucide-react";
import { ProfileLanguageStats } from "@/components/profile/ProfileLanguageStats";
import { ProfileStats } from "@/components/profile/ProfileStats";
import Navbar from "@/components/ui/navbar";
import PageTransitionWrapper from "@/components/TransitionWrapper";
import { useUserStore } from "@/stores/userStore";
import { useMutationHook } from "@/hooks/useMutationHook";
import EditProfileModal from "./_components/EditProfileModal";
import { getUserApi, updateProfileVisibilityApi, updateUserApi } from "@/apis/userApi";
import { toast } from "sonner";
import Link from "next/link";
import PaymentHistory from "./_components/PaymentHistory";
import Loading from "@/components/Loading";
import ContributorsCircle from "./_components/ContributorsCircle";
import ConfirmationModal from "@/components/ConfirmationModal";
import { ContributionGraph } from "../contributor/_components/ContributionGraph";
import { useUserProjects, useContributedProjects } from "@/hooks/useProjectQueries";
import { useUsedLanguages, useStarredSnippets, useAiUsage, useProfileVisibility, PROFILE_KEYS } from "@/hooks/useProfileQueries";
import { useQueryClient } from "@tanstack/react-query";

const Page = () => {
    const queryClient = useQueryClient();
    const userSubscription = useUserStore((state) => state.subscription);
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const userId = user?.id;

    const { data: userProjects = [] } = useUserProjects(userId);
    const { data: contributedProjectsList = [] } = useContributedProjects(userId);
    const { data: usedLanguages = [] } = useUsedLanguages(userId);
    const { data: starredSnippets = [], isLoading: snippetsLoading } = useStarredSnippets();
    const { data: aiusage = 0 } = useAiUsage();
    const { data: isProfileVisible = true } = useProfileVisibility(userId);

    const totalProjects = userProjects.length;
    const totalContributedProj = contributedProjectsList.length;
    const totalStarredSnippet = starredSnippets.length;

    const { mutate: getUserData } = useMutationHook(getUserApi, {
        onSuccess(data) {
            setUser({ ...user, ...data.data });
        },
    });

    const { mutate: updateUser } = useMutationHook(updateUserApi, {
        onSuccess(data) {
            getUserData();
            toast.success(data.message || "User updated successfully");
        },
    });

    const { mutate: updateVisibility } = useMutationHook(updateProfileVisibilityApi, {
        onSuccess(data) {
            if (!user) return;
            toast.success(data.message || "Updated successfully");
            queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.profileVisibility(userId) });
            setIsModalOpen(false);
        },
    });

    const handleVisibleToggle = () => {
        updateVisibility(!isProfileVisible);
    };

    if (!user) return null;

    const handleSave = (updatedUser: { name: string; github: string; portfolio: string; avatar: string }) => {
        updateUser(updatedUser);
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
                                        {user.name.split(" ").map((n) => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                                        <Badge
                                            className="bg-green text-black ml-2 cursor-pointer"
                                            onClick={() => setIsEditModalOpen(true)}
                                        >
                                            <PenLine />
                                            Edit
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="flex mt-3 gap-2">
                                        {user?.github && (
                                            <Link target="_blank" href={user.github}>
                                                <Badge variant="outline" className=" cursor-pointer flex bg-black items-center gap-1 hover-scale">
                                                    <GithubIcon className="text-white" size={14} />
                                                    <span className="text-white">GitHub</span>
                                                </Badge>
                                            </Link>
                                        )}
                                        {user?.portfolio && (
                                            <Link target="_blank" href={user.portfolio}>
                                                <Badge variant="outline" className=" cursor-pointer flex bg-black items-center gap-1 hover-scale">
                                                    <Globe className="text-white" size={14} />
                                                    <span className="text-white">Portfolio</span>
                                                </Badge>
                                            </Link>
                                        )}
                                        <div onClick={() => setIsModalOpen(true)}>
                                            <Badge className={`cursor-pointer ${isProfileVisible ? "bg-green-500" : "bg-red-500"} flex items-center gap-1 hover-scale`}>
                                                <Globe className="text-white" size={14} />
                                                <span className="text-white">{isProfileVisible ? "Public" : "Private"}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-tertiary p-3 rounded-md">
                                <p className="text-3xl font-semibold text-white">{userSubscription?.name}</p>
                                <div className="flex justify-between gap-x-5 mt-3 text-white">
                                    {userSubscription?.startDate && (
                                        <p>
                                            Started at: <span className="font-semibold bg-green-500 p-1 rounded">{userSubscription.startDate.toString().slice(0, 10)}</span>
                                        </p>
                                    )}
                                    {userSubscription?.endDate && (
                                        <p>
                                            Expiry: <span className="font-semibold bg-red-500 p-1 rounded">{userSubscription.endDate.toString().slice(0, 10)}</span>
                                        </p>
                                    )}
                                </div>

                                {userSubscription?.nextPlanId && (
                                    <div className="flex justify-between gap-x-5 rounded border-2 p-2 text-black bg-white opacity-30 mt-4">
                                        <p>Next plan scheduled at: </p>
                                        <p>{userSubscription.endDate.toString().slice(0, 10)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <ProfileStats
                                icon={<Terminal className="mygreen" />}
                                title="Projects"
                                totalProjects={totalProjects}
                                totalContributedProjects={totalContributedProj}
                                totalAiUsage={aiusage}
                            />
                            {snippetsLoading ? <Loading text="Fetching..." /> :
                                <ProfileStats icon={<Code className="mygreen" />} title="Starred Snippets" value={totalStarredSnippet} />
                            }
                            {usedLanguages.length > 0 && <ProfileLanguageStats languages={usedLanguages} />}
                        </div>

                        <ContributionGraph id={user.id} />

                        <div className="py-10">
                            <h1 className="text-2xl font-bold text-white mb-4">Top Contributors</h1>
                            <ContributorsCircle />
                        </div>

                        <PaymentHistory />
                    </div>
                </div>
            </PageTransitionWrapper>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                user={user}
            />

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleVisibleToggle}
                content={
                    isProfileVisible ? (
                        <p>
                            Are you sure you want to make your profile private? This will hide your profile from other users.
                        </p>
                    ) : (
                        <p>Are you sure you want to continue with this action?</p>
                    )
                }
            />
        </>
    );
};

export default Page;

