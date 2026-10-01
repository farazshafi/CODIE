import { useQuery } from "@tanstack/react-query";
import { getProjectsByUserIdApi, getContributedProjectsApi } from "@/apis/projectApi";
import { ProjectCardType } from "@/types";

export const PROJECT_KEYS = {
    userProjects: (userId?: string) => ["user-projects", userId] as const,
    contributedProjects: (userId?: string) => ["contributed-projects", userId] as const,
};

export const useUserProjects = (userId?: string) => {
    return useQuery<ProjectCardType[]>({
        queryKey: PROJECT_KEYS.userProjects(userId),
        queryFn: async () => {
            const response = await getProjectsByUserIdApi();
            return response?.data?.projects || response?.data || [];
        },
        enabled: !!userId,
    });
};

export const useContributedProjects = (userId?: string) => {
    return useQuery<ProjectCardType[]>({
        queryKey: PROJECT_KEYS.contributedProjects(userId),
        queryFn: async () => {
            const response = await getContributedProjectsApi(userId!);
            return response?.data || [];
        },
        enabled: !!userId,
    });
};
