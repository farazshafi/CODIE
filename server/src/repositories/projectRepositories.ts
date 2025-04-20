import ProjectModel from "../models/projectModel"
import { CreateProjectType } from "../types/projectType"

class ProjectRepositories {
    async createProject(data: CreateProjectType) {
        return await ProjectModel.create(data)
    }

    async isProjectNameExists(data: { userId: string, projectName: string, language: string }): Promise<boolean> {
        const project = await ProjectModel.findOne({
            userId: data.userId,
            projectName: { $regex: `^${data.projectName}$`, $options: "i" },
            projectLanguage: data.language
        });
        return !!project;
    }

    async findProjectById(id: string) {
        return await ProjectModel.findById(id)
    }

    async findProjectByUserId(userId:string){
        return await ProjectModel.find({userId})
    }

}

export const projectRepositories = new ProjectRepositories()
