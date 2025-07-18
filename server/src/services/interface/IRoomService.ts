import { IProject } from "../../models/projectModel";
import { IRoom } from "../../models/roomModel";


export interface IRoomService {
    createRoom(projectId: string, ownerId: string): Promise<IRoom>;
    getRoomByProjectId(projectId: string): Promise<IRoom>;
    updateCollabratorRole(roomId: string, userId: string, role: "viewer" | "editor"): Promise<IRoom>
    removeContributer(userId: string, projectId: string): Promise<IRoom>;
    getContributedProjectsByUserId(userId: string): Promise<IProject[]>;
    isEligibleToEdit(userId: string, roomId: string): Promise<boolean>;
    getUserRoleInProject(projectId: string, userId: string): Promise<string>;
}