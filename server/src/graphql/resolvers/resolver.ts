import { projectService, roomService } from "../../container"


export const resolvers = {
    Query: {
        getProjectsByUserId: async (parent, args) => {
            const { userId } = args
            return projectService.getProjectsByUserId(userId)
        },

        getContributedProjectsByUserId: async (parent, args) => {
            const { userId } = args
            return await roomService.getContributedProjectsByUserId(userId)
        }

    }
}
