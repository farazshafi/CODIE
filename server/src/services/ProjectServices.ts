import mongoose from 'mongoose';
import { IProjectRepository } from '../repositories/interface/IProjectRepository';
import { CreateProjectType } from '../types/projectType';
import { HttpError } from '../utils/HttpError';
import { IProjectService } from './interface/IProjectService';
import { IProject } from '../models/ProjectModel';
import { IRoomRepository } from '../repositories/interface/IRoomRepository';
import { ISubscriptionRepository } from '../repositories/interface/ISubscriptionRepository';
import { IUserSubscriptionRepository } from '../repositories/interface/IUserSubscriptionRepository';
import { IRoomService } from './interface/IRoomService';
import { IDiscoverRepository } from '../repositories/interface/IDiscoverRepository';

export class ProjectService implements IProjectService {
    constructor(
        private readonly _projectRepository: IProjectRepository,
        private readonly _roomRepository: IRoomRepository,
        private readonly _subscriptionRepository: ISubscriptionRepository,
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        private readonly _roomService: IRoomService,
        private readonly _discoverRepository: IDiscoverRepository,
    ) { }

    async createProject(data: CreateProjectType): Promise<IProject> {
        try {
            const isExist = await this._projectRepository.isProjectNameExists({
                userId: data.userId,
                projectName: data.projectName,
                language: data.projectLanguage
            });

            if (isExist) {
                throw new HttpError(400, "Project name already exists for this language.");
            }

            // make sure he wont create project more than (x) given in plan, and store owner plan id
            const userPlanId = await this._userSubscriptionRepository.findOne({ userId: new mongoose.Types.ObjectId(data.userId) })
            console.log("checking".bgGreen, userPlanId)

            const plan = await this._subscriptionRepository.findById(userPlanId.planId.toString())
            console.log("user plan ", plan)
            const totalProjects = (await this._projectRepository.find({ userId: data.userId })).length
            if (totalProjects >= plan.maxPrivateProjects) {
                throw new HttpError(400, "You have reached the maximum number of projects, Upgrade your plan.");
            }

            return await this._projectRepository.create({
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
        return this._projectRepository.findProjectByUserId(userId);
    }

    async getProjectById(id: string): Promise<IProject> {
        const project = await this._projectRepository.findById(id);
        if (!project) {
            throw new HttpError(404, "Project not found");
        }
        return project;
    }

    async getAllProjects(): Promise<IProject[]> {
        return this._projectRepository.findAll();
    }

    async getProjectByRoomId(roomId: string): Promise<string> {
        if (!roomId) {
            throw new HttpError(400, "Room ID is required.");
        }

        const project = await this._projectRepository.findProjectByRoomId(roomId);
        if (!project) {
            throw new HttpError(404, "Project not found for that room id");
        }
        return project;
    }

    async saveCode(id: string, updatedCode: string): Promise<IProject> {
        try {
            const project = await this._projectRepository.findById(id);
            if (project) {
                return await this._projectRepository.updateCode(project.id, updatedCode);
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
        const project = await this._projectRepository.findById(projectId);
        if (!project) {
            throw new HttpError(404, "Project not found.");
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const room = await this._roomRepository.getRoomByProjectId(projectId);
            if (room) {
                const isRoomDeleted = await this._roomRepository.delete(room._id as string, session);
                if (!isRoomDeleted) {
                    throw new HttpError(500, `Failed to delete room with ID: ${room._id} for project ID: ${projectId}`);
                }
            }

            const snippet = await this._discoverRepository.findOne({ projectId });
            if (snippet) {
                await this._discoverRepository.deleteOne({ projectId }, session);
            }

            const isProjectDeleted = await this._projectRepository.delete(projectId, session);
            if (!isProjectDeleted) {
                throw new HttpError(500, "Failed to delete the project.");
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            if (error instanceof HttpError) {
                throw error;
            }
            throw new HttpError(500, "Transaction failed. All changes rolled back.");
        }
        session.endSession();


        return { message: "Project and associated room deleted successfully." };
    }

    async getSavedCode(id: string): Promise<IProject> {
        try {
            const project = await this._projectRepository.findById(id);
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

    async getUsedLanguages(userId: mongoose.Types.ObjectId): Promise<{ name: string; count: number }[]> {
        try {
            const userProjects = await this._projectRepository.find({ userId })
            const contributedProjects = await this._roomService.getContributedProjectsByUserId(String(userId));
            userProjects.push(...contributedProjects);

            const languageCount: Record<string, number> = {}
            for (const project of userProjects) {
                if (languageCount[project.projectLanguage]) {
                    languageCount[project.projectLanguage] = languageCount[project.projectLanguage] + 1
                } else {
                    languageCount[project.projectLanguage] = 1
                }
            }
            const language = Object.entries(languageCount).map(([name, count]) => ({ name, count }))
            return language
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error)
            throw new HttpError(500, "Error while getting used languages")
        }
    }

    async adminDashboardProjectData(): Promise<{ title: string, value: string, icon: string, change: string, positive: boolean }> {
        try {
            const totalProjects = await this._projectRepository.count({});

            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const projectsThisMonth = await this._projectRepository.count({ createdAt: { $gte: startOfThisMonth } });

            const projectsLastMonth = await this._projectRepository.count({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });

            let change = '0%';
            let positive = true;
            if (projectsLastMonth > 0) {
                const percentChange = ((projectsThisMonth - projectsLastMonth) / projectsLastMonth) * 100;
                change = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
                positive = percentChange >= 0;
            } else if (projectsThisMonth > 0) {
                change = '+100%';
                positive = true;
            }

            const icon = 'Projects';

            return {
                title: 'Total Projects',
                value: totalProjects.toLocaleString(),
                icon,
                change,
                positive
            };
        } catch (error) {
            console.log(error);
            throw new HttpError(500, "Server error while getting dashboard user data");
        }
    }

}
