import { projectService } from "../../services/projectServices";


export const resolvers = {
    Query: {
        getProjectsByUserId: async (parent,args) => {
            const {userId} = args
            return projectService.getProjectByUserId(userId)
        }

    }
}
