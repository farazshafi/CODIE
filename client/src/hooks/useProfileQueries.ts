import { useQuery } from "@tanstack/react-query";
import { getUsedLanguagesApi } from "@/apis/projectApi";
import { getStarredSnippetsApi } from "@/apis/starredApi";
import { getUserAiUsageApi } from "@/apis/userSubscriptionApi";
import { getProfileVisibilityApi } from "@/apis/userApi";

export const PROFILE_KEYS = {
    usedLanguages: (userId?: string) => ["used-languages", userId] as const,
    starredSnippets: () => ["starred-snippets"] as const,
    aiUsage: () => ["ai-usage"] as const,
    profileVisibility: (userId?: string) => ["profile-visibility", userId] as const,
};

export const useUsedLanguages = (userId?: string) => {
    return useQuery<{ name: string; count: number }[]>({
        queryKey: PROFILE_KEYS.usedLanguages(userId),
        queryFn: async () => {
            const response = await getUsedLanguagesApi(userId!);
            return response?.data || [];
        },
        enabled: !!userId,
    });
};

export const useStarredSnippets = () => {
    return useQuery<any[]>({
        queryKey: PROFILE_KEYS.starredSnippets(),
        queryFn: async () => {
            const response = await getStarredSnippetsApi();
            return response?.data || [];
        },
    });
};

export const useAiUsage = () => {
    return useQuery<number>({
        queryKey: PROFILE_KEYS.aiUsage(),
        queryFn: async () => {
            const response = await getUserAiUsageApi();
            return response?.data || 0;
        },
    });
};

export const useProfileVisibility = (userId?: string) => {
    return useQuery<boolean>({
        queryKey: PROFILE_KEYS.profileVisibility(userId),
        queryFn: async () => {
            const response = await getProfileVisibilityApi(userId!);
            return response?.data?.isVisible ?? true;
        },
        enabled: !!userId,
    });
};
