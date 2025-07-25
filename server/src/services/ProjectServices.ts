import mongoose from 'mongoose';
import { IProjectRepository } from '../repositories/interface/IProjectRepository';
import { CreateProjectType } from '../types/projectType';
import { HttpError } from '../utils/HttpError';
import { IProjectService } from './interface/IProjectService';
import { IProject } from '../models/ProjectModel';
import { IRoomRepository } from '../repositories/interface/IRoomRepository';
import { ISubscriptionRepository } from '../repositories/interface/ISubscriptionRepository';
import { IUserSubscriptionRepository } from '../repositories/interface/IUserSubscriptionRepository';

export class ProjectService implements IProjectService {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly roomRepository: IRoomRepository,
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly userSubscriptionRepository: IUserSubscriptionRepository,
    ) { }

    async createProject(data: CreateProjectType): Promise<IProject> {
        try {
            const isExist = await this.projectRepository.isProjectNameExists({
                userId: data.userId,
                projectName: data.projectName,
                language: data.projectLanguage
            });

            if (isExist) {
                throw new HttpError(400, "Project name already exists for this language.");
            }

            // make sure he wont create project more than (x) given in plan, and store owner plan id
            const userPlanId = await this.userSubscriptionRepository.findOne({ userId: new mongoose.Types.ObjectId(data.userId) })
            console.log("checking".bgGreen, userPlanId)

            const plan = await this.subscriptionRepository.findById(userPlanId.planId.toString())
            console.log("user plan ", plan)
            const totalProjects = (await this.projectRepository.find({ userId: data.userId })).length
            if (totalProjects >= plan.maxPrivateProjects) {
                throw new HttpError(400, "You have reached the maximum number of projects, Upgrade your plan.");
            }

            return await this.projectRepository.create({
                ...data,
                userId: new mongoose.Types.ObjectId(data.userId)
            });
        } catch (error) {

            if (error instanceof HttpError) {
                throw error;
            }
            throw new HttpError(400, "Project name already exists for this language.");
        }
    }

    async getProjectsByUserId(userId: string): Promise<IProject[]> {
        if (!userId) {
            throw new HttpError(400, "User ID is required.");
        }
        return this.projectRepository.findProjectByUserId(userId);
    }

    async getProjectById(id: string): Promise<IProject> {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new HttpError(404, "Project not found");
        }
        return project;
    }

    async getAllProjects(): Promise<IProject[]> {
        return this.projectRepository.findAll();
    }

    async getProjectByRoomId(roomId: string): Promise<string> {
        if (!roomId) {
            throw new HttpError(400, "Room ID is required.");
        }

        const project = await this.projectRepository.findProjectByRoomId(roomId);
        if (!project) {
            throw new HttpError(404, "Project not found for that room id");
        }
        return project;
    }

    async saveCode(id: string, updatedCode: string): Promise<IProject> {
        try {
            const project = await this.projectRepository.findById(id);
            if (project) {
                return await this.projectRepository.updateCode(project.id, updatedCode);
            } else {
                throw new HttpError(404, "Project not found");
            }
        } catch (err) {
            console.log("Error saving code", err);
            if (err instanceof HttpError) {
                throw err;
            }
            throw new HttpError(500, "Failed to save code. Please try again.");
        }
    }

    async deleteProject(projectId: string): Promise<{ message: string }> {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new HttpError(404, "Project not found.");
        }

        const isProjectDeleted = await this.projectRepository.delete(projectId);
        if (!isProjectDeleted) {
            throw new HttpError(500, "Failed to delete the project.");
        }

        const room = await this.roomRepository.getRoomByProjectId(projectId);
        if (room) {
            const isRoomDeleted = await this.roomRepository.delete(room._id as string);
            if (!isRoomDeleted) {
                console.error(`Failed to delete room with ID: ${room._id} for project ID: ${projectId}`);
            }
        }

        return { message: "Project and associated room deleted successfully." };
    }

    async getSavedCode(id: string): Promise<IProject> {
        try {
            const project = await this.projectRepository.findById(id);
            if (project) {
                return project;
            } else {
                throw new HttpError(404, "Project not found");
            }
        } catch (err) {
            console.log("Error saving code", err);
            if (err instanceof HttpError) {
                throw err;
            }
            throw new HttpError(500, "Failed to save code. Please try again.");
        }
    }
}
