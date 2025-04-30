import { projectService } from "../../container"


export const resolvers = {
    Query: {
        getProjectsByUserId: async (parent,args) => {
            const {userId} = args
            return projectService.getProjectsByUserId(userId)
        }

    }
}
