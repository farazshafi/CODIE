import { IProject } from "../../models/projectModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IProjectRepository extends IBaseRepository<IProject> {
    isProjectNameExists(data: {
        userId: string;
        projectName: string;
        language: string;
    }): Promise<boolean>;
    findProjectByUserId(userId: string): Promise<IProject[]>;
    findProjectByRoomId(roomId: string): Promise<string | null>;
    updateCode(project: IProject, code: string): Promise<IProject>;
    getProjectByIds(ids: string[]): Promise<IProject[]>;
}