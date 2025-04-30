import mongoose from 'mongoose';
import { IProjectRepository } from '../repositories/interface/IProjectRepository';
import { CreateProjectType } from '../types/projectType';
import { HttpError } from '../utils/HttpError';

export class ProjectService {
    constructor(private readonly projectRepository: IProjectRepository) { }

    async createProject(data: CreateProjectType) {
        try {
            const isExist = await this.projectRepository.isProjectNameExists({
                userId: data.userId,
                projectName: data.projectName,
                language: data.projectLanguage
            });

            if (isExist) {
                throw new HttpError(400, "Project name already exists for this language.");
            }

            return await this.projectRepository.create({
                ...data,
                userId: new mongoose.Types.ObjectId(data.userId)
            });
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(400, "Project name already exists for this language.");
        }
    }

    async getProjectsByUserId(userId: string) {
        if (!userId) {
            throw new HttpError(400, "User ID is required.");
        }
        return this.projectRepository.findProjectByUserId(userId);
    }

    async getProjectById(id: string) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new HttpError(404, "Project not found");
        }
        return project;
    }

    async getAllProjects() {
        return this.projectRepository.findAll();
    }

    async getProjectByRoomId(roomId: string) {
        if (!roomId) {
            throw new HttpError(400, "Room ID is required.");
        }

        const projectId = await this.projectRepository.findProjectByRoomId(roomId);
        if (!projectId) {
            throw new HttpError(404, "Project not found for that room id");
        }
        return projectId;
    }

    async saveCode(id: string, updatedCode: string) {
        try {
            const project = await this.projectRepository.findById(id)
            if (project) {
                return await this.projectRepository.updateCode(project, updatedCode)
            } else {
                throw new HttpError(404, "Project not found");
            }
        } catch (err) {
            console.log("Error saving code", err)
            if (err instanceof HttpError) {
                throw err;
            }

            throw new HttpError(500, "Failed to save code. Please try again.");
        }
    }

    async deleteProject(projectId: string) {
        const isDeleted = await this.projectRepository.delete(projectId);
        if (!isDeleted) {
            throw new HttpError(404, "Project not found or already deleted.");
        }
        return { message: "Project deleted successfully." };
    }

    async getSavedCode(id: string) {
        try {
            const project = await this.projectRepository.findById(id)
            if (project) {
                return project
            } else {
                throw new HttpError(404, "Project not found")
            }
        } catch (err) {
            console.log("Error saving code", err)
            if (err instanceof HttpError) {
                throw err;
            }

            throw new HttpError(500, "Failed to save code. Please try again.");
        }
    }
}