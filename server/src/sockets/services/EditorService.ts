import { IOnlineUserRepository } from "../repositories/interface/IOnlineUserRepository";
import { IEditorService } from "./interface/IEditorService";

export class EditorService implements IEditorService {
    constructor(private readonly onlineUserRepo: IOnlineUserRepository) { }

    async joinRoom(projectId: string, userId: string, socketId: string): Promise<string[]> {
        const isUserAlreadyInRoom = await this.onlineUserRepo.isUserOnline(projectId, userId)
        if (!isUserAlreadyInRoom) {
            await this.onlineUserRepo.addUserToRoom(projectId, userId, socketId);
        }
        return this.onlineUserRepo.getUsersInRoom(projectId);
    }

    async leaveRoom(projectId: string, userId: string, socketId: string): Promise<string[]> {
        await this.onlineUserRepo.removeUserFromRoom(projectId, userId, socketId);
        return this.onlineUserRepo.getUsersInRoom(projectId);
    }

    async getOnlineUsers(projectId: string): Promise<string[]> {
        return this.onlineUserRepo.getUsersInRoom(projectId);
    }
}
