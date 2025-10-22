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

    }
}
