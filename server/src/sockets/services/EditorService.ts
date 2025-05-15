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

    async leaveAllRooms(socketId: string): Promise<string[]> {
        const rooms = await this.onlineUserRepo.removeUserFromAllRooms(socketId);
        return rooms;
    }

    async getOnlineUsers(projectId: string): Promise<string[]> {
        return this.onlineUserRepo.getUsersInRoom(projectId);
    }
}
