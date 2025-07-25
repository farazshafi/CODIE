import mongoose from "mongoose"
import { IProject } from "../models/ProjectModel"
import { IRoom } from "../models/RoomModel"
import { IProjectRepository } from "../repositories/interface/IProjectRepository"
import { IRoomRepository } from "../repositories/interface/IRoomRepository"
import { CreateRoomType } from "../types/roomType"
import { generateRoomId } from "../utils/generateRoomId"
import { HttpError } from "../utils/HttpError"
import { IRoomService } from "./interface/IRoomService"

export class RoomServices implements IRoomService {
    constructor(
        private readonly roomRepository: IRoomRepository,
        private readonly projectRepository: IProjectRepository
    ) { }

    async createRoom(projectId: string, ownerId: string): Promise<IRoom> {
        try {
            let roomId = generateRoomId()
            const roomData: CreateRoomType = {
                projectId,
                ownerId,
                roomId
            }
            let existRoom = await this.roomRepository.findRoomById(roomId)

            while (existRoom) {
                roomId = generateRoomId();
                existRoom = await this.roomRepository.findRoomById(roomId);
            }

            return await this.roomRepository.createRoom(roomData)
        } catch (err) {
            console.error("Failed when creating room: ", err)
            throw new HttpError(500, "Failed to create room")
        }
    }

    async getRoomByProjectId(projectId: string): Promise<IRoom> {
        try {
            const existRoom = await this.roomRepository.getRoomByProjectId(projectId)
            if (!existRoom) {
                return null
            }

            return existRoom
        } catch (err) {
            if (err instanceof HttpError) {
                throw err
            }
            console.error("Failed when getting room: ", err)
            throw new HttpError(500, "failed to get room")
        }
    }

    async updateCollabratorRole(roomId: string, userId: string, role: "viewer" | "editor"): Promise<IRoom> {
        try {
            const room = await this.roomRepository.findOne({ roomId })
            if (!room) {
                throw new HttpError(404, "Room Not Found!")
            }

            return this.roomRepository.findRoomAndUpdateRole(roomId, role, userId)
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log("Error while updating role", error)
            throw new HttpError(500, "Error while updating role")
        }
    }

    async getContributedProjectsByUserId(userId: string): Promise<IProject[]> {
        try {
            const rooms = await this.roomRepository.find({
                "collaborators.user": new mongoose.Types.ObjectId(userId),
                owner: { $ne: new mongoose.Types.ObjectId(userId) }
            });
            const projectIds = rooms.map(room => room.projectId.toString());
            return await this.projectRepository.getProjectByIds(projectIds)
        } catch (error) {
            console.log("Occured whiel getting contributed projects", error)
            throw new HttpError(500, "Occured whiel getting contributed projects")
        }
    }

    async isEligibleToEdit(userId: string, roomId: string): Promise<boolean> {
        try {
            const room = await this.roomRepository.findOne({ roomId })
            if (!room) {
                throw new HttpError(404, "Room Not found!")
            }

            const collaborator = room.collaborators.find(c => c.user._id.toString() === userId)
            if (!collaborator) {
                throw new HttpError(404, "User not found in collabrators")
            }

            return collaborator.role === "owner" || collaborator.role === "editor" ? true : false
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Cannot check permission")
        }
    }

    async getUserRoleInProject(projectId: string, userId: string): Promise<string> {
        try {
            const room = await this.roomRepository.findOne({ projectId })
            if (!room) {
                throw new HttpError(404, "Room not found")
            }
            const isOwner = room.owner.toString() === userId
            if (isOwner) {
                return "owner"
            }

            const role = await this.roomRepository.findContributerRole(userId, projectId)
            return role

        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Error While getting role")
        }
    }

    async removeContributer(userId: string, projectId: string): Promise<IRoom> {
        try {
            const updatedContributers = await this.roomRepository.removeUserFromCollabrators(userId, new mongoose.Types.ObjectId(projectId))
            if (!updatedContributers) {
                throw new HttpError(404, "Cannot find User in contributers")
            }
            return updatedContributers
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Cannot remove Contributer from room")
            console.log("cannot remove contributer from room", error)
        }
    }
}

