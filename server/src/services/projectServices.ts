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
            } else {
                return await projectRepositories.findProjectByUserId(userId)
            }

        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }

            throw new HttpError(500, "Failed to retrieve projects. Please try again.");
        }
    }

    async getProjectByRoomId(roomId: string) {
        try {
            if (!roomId) {
                throw new HttpError(400, "room ID is required.");
            } else {
                const projectId = projectRepositories.findProjectByRoomId(roomId)
                if (!projectId) {
                    throw new HttpError(404, "Project not found for that room id")
                }
                return projectId
            }

        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }

            throw new HttpError(500, "Failed to retrieve projects. Please try again.");
        }
    }

    async deleteProject(projectId: string) {
        try {
            const isdeleted = await projectRepositories.deleteProject(projectId)
            if (isdeleted) {
                return { message: "Project deleted successfully." };
            } else {
                throw new HttpError(404, "Project not found or already deleted.");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
            if (error instanceof HttpError) {
                throw error;
            }
            throw new HttpError(500, "Failed to delete project. Please try again.");
        }
    }


}

export const projectService = new ProjectService();
