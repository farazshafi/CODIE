import { projectService, roomService } from "../../container"


export const resolvers = {
    Query: {
        getProjectsByUserId: async (parent, args) => {
            try {
                const { userId } = args;
                if (!userId) return [];
                const projects = await projectService.getProjectsByUserId(userId);
                return projects?.projects || [];
            } catch (error) {
                console.error("GraphQL getProjectsByUserId error:", error);
                return [];
            }
        },

        getContributedProjectsByUserId: async (parent, args) => {
            try {
                const { userId } = args;
                if (!userId) return [];
                const contributedProjects = await roomService.getContributedProjectsOld(userId);
                return contributedProjects || [];
            } catch (error) {
                console.error("GraphQL getContributedProjectsByUserId error:", error);
                return [];
            }
        }
    },
    Project: {
        id: (project) => project._id ? project._id.toString() : (project.id ? project.id.toString() : ""),
        userId: (project) => project.userId ? project.userId.toString() : "",
        codePreview: (project) => {
            const code = typeof project?.projectCode === "string" ? project.projectCode : ""
            return code
                .split(/\r?\n/)
                .map((line: string) => line.trimEnd())
                .filter((line: string) => line.trim().length > 0)
                .slice(0, 5)
        }
    }
}
