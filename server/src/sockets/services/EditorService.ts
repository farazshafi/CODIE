import { IRoom } from "../../models/RoomModel";
import { IProjectRepository } from "../../repositories/interface/IProjectRepository";
import { IRoomRepository } from "../../repositories/interface/IRoomRepository";
import { IOnlineUserRepository } from "../repositories/interface/IOnlineUserRepository";
import { IEditorService } from "./interface/IEditorService";

export class EditorService implements IEditorService {
    constructor(
        private readonly _onlineUserRepo: IOnlineUserRepository,
        private readonly _roomRepository: IRoomRepository,
        private readonly _projectRepository: IProjectRepository
    ) { }

    async joinRoom(projectId: string, userId: string, socketId: string): Promise<string[]> {
        const isUserAlreadyInRoom = await this._onlineUserRepo.isUserOnline(projectId, userId)
        if (!isUserAlreadyInRoom) {
            await this._onlineUserRepo.addUserToRoom(projectId, userId, socketId);
        }
        return this._onlineUserRepo.getUsersInRoom(projectId);
    }

    async leaveRoom(projectId: string, userId: string, socketId: string): Promise<string[]> {
        await this._onlineUserRepo.removeUserFromRoom(projectId, userId, socketId);
        return this._onlineUserRepo.getUsersInRoom(projectId);
    }

    async getOnlineUsers(projectId: string): Promise<string[]> {
        return this._onlineUserRepo.getUsersInRoom(projectId);
    }

    async getRoomByProjectId(projectId: string): Promise<IRoom> {
        return await this._roomRepository.getRoomByProjectId(projectId)
    }

    async saveCode(projectId: string, code: string): Promise<void> {
        await this._projectRepository.updateCode(projectId, code)
    }

    async isUserOnline(projectId: string, userId: string): Promise<boolean> {
        return await this._onlineUserRepo.isUserOnline(projectId, userId)
    }

    async getSocketIdByUserId(userId: string, projectId: string): Promise<string | null> {
        return await this._onlineUserRepo.getSocketIdByUserId(projectId, userId)
    }

}
