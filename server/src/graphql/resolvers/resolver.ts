import { projectService, roomService } from "../../container"


export const resolvers = {
    Query: {
        getProjectsByUserId: async (parent, args) => {
            const { userId } = args
            const projects = await projectService.getProjectsByUserId(userId)
            return projects.projects
        },

        getContributedProjectsByUserId: async (parent, args) => {
            const { userId } = args
            const contributedProjects = await roomService.getContributedProjectsOld(userId)
            console.log("resolver : contributed projects".yellow, contributedProjects)
            return contributedProjects
        }

    },
    Project: {
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
