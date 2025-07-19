import { IRoom } from "../../models/RoomModel";
import { IProjectRepository } from "../../repositories/interface/IProjectRepository";
import { IRoomRepository } from "../../repositories/interface/IRoomRepository";
import { IOnlineUserRepository } from "../repositories/interface/IOnlineUserRepository";
import { IEditorService } from "./interface/IEditorService";

export class EditorService implements IEditorService {
    constructor(
        private readonly onlineUserRepo: IOnlineUserRepository,
        private readonly roomRepository: IRoomRepository,
        private readonly projectRepository: IProjectRepository
    ) { }

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

    async getRoomByProjectId(projectId: string): Promise<IRoom> {
        return await this.roomRepository.getRoomByProjectId(projectId)
    }

    async saveCode(projectId: string, code: string): Promise<void> {
        await this.projectRepository.updateCode(projectId, code)
    }

    async isUserOnline(projectId: string, userId: string): Promise<boolean> {
        return await this.onlineUserRepo.isUserOnline(projectId, userId)
    }

    async getSocketIdByUserId(userId: string, projectId: string): Promise<string | null> {
        return await this.onlineUserRepo.getSocketIdByUserId(projectId, userId)
    }

}
