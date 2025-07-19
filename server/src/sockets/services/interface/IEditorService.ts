import { IRoom } from "../../../models/RoomModel";


export interface IEditorService {
    joinRoom(projectId: string, userId: string, socketId: string): Promise<string[]>;
    getOnlineUsers(projectId: string): Promise<string[]>;
    leaveRoom(projectId: string, userId: string, socketId: string): Promise<string[]>
    getRoomByProjectId(projectId: string): Promise<IRoom>;
    saveCode(projectId: string, code: string): Promise<void>;
    isUserOnline(projectId: string, userId: string): Promise<boolean>;
    getSocketIdByUserId(userId: string, projectId: string): Promise<string | null>
}