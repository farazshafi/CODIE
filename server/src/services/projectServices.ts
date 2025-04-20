import { projectRepositories } from "../repositories/projectRepositories";
import { CreateProjectType } from "../types/projectType";
import { HttpError } from "../utils/HttpError";

class ProjectService {
    async createProject(data: CreateProjectType) {
        try {
            const isExist = await projectRepositories.isProjectNameExists({
                userId: data.userId,
                projectName: data.projectName,
                language: data.projectLanguage
            });

            if (isExist) {
                throw new HttpError(400, "Project name already exists for this language.");
            }

            const result = await projectRepositories.createProject(data);
            return result;

        } catch (error) {
            console.error("Error creating project:", error);

            if (error instanceof HttpError) {
                throw error;
            }

            throw new HttpError(500, "Failed to create project. Please try again.");
        }
    }

    async getProjectByUserId(userId: string) {
        try {
            if (!userId) {
                throw new HttpError(400, "User ID is required.");
            }else{
                return await projectRepositories.findProjectByUserId(userId)
            }

        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }

            throw new HttpError(500, "Failed to retrieve projects. Please try again.");
        }
    }

}

export const projectService = new ProjectService();
