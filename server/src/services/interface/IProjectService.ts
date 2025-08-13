
import mongoose from "mongoose";
import { IProject } from "../../models/ProjectModel";
import { CreateProjectType } from "../../types/projectType";

export interface IProjectService {
    createProject(data: CreateProjectType): Promise<IProject>;
    getProjectsByUserId(userId: string): Promise<IProject[]>;
    getProjectById(id: string): Promise<IProject>;
    getAllProjects(): Promise<IProject[]>;
    getProjectByRoomId(roomId: string): Promise<string>;
    saveCode(id: string, updatedCode: string): Promise<IProject>;
    deleteProject(projectId: string): Promise<{ message: string }>;
    getSavedCode(id: string): Promise<IProject>;
    getUsedLanguages(userId: mongoose.Types.ObjectId): Promise<{ name: string; count: number }[]>;
    adminDashboardProjectData(): Promise<{ title: string, value: string, icon: string, change: string, positive: boolean }>;
}
