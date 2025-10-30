import { IProject } from "../../models/ProjectModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IProjectRepository extends IBaseRepository<IProject> {
    isProjectNameExists(data: {
        userId: string;
        projectName: string;
        language: string;
    }): Promise<boolean>;
    findProjectByUserId(userId: string): Promise<IProject[]>;
    findProjectByRoomId(roomId: string): Promise<string | null>;
    updateCode(projectId: string, code: string): Promise<IProject>;
    getProjectByIds(ids: string[]): Promise<IProject[]>;
    getProjectsByYear(year: number): Promise<{ month: string, projects: number }[]>;
    getMontlyDataForGraphOverview(year: number): Promise<{ _id: number; count: number; }[]>;
    getYearlyDataForGraphOverview(): Promise<{ _id: number; count: number; }[]>

}