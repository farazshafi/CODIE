import { Model } from "mongoose"
import Room, { IRoom } from "../models/roomModel"
import { CreateRoomType } from "../types/roomType"
import { BaseRepository } from "./baseRepository"
import { IRoomRepository } from "./interface/IRoomRepository"

export class RoomRepositories extends BaseRepository<IRoom> implements IRoomRepository {
    constructor(model: Model<IRoom>) {
        super(model)
    }

    async createRoom({ roomId, projectId, ownerId }: CreateRoomType): Promise<IRoom> {
        return await Room.create({
            roomId,
            projectId,
            owner: ownerId,
            collaborators: [{ user: ownerId, role: "owner" }]
        })
    }

    async findRoomById(roomId: string): Promise<IRoom> {
        return await Room.findOne({ roomId }).populate("collaborators.user")
    }

    async addUserToCollabrators(userId: string, roomId: string): Promise<IRoom> {
        return await Room.findOneAndUpdate(
            { roomId },
            { $addToSet: { collaborators: { user: userId, role: "viewer" } } },
            { new: true }
        ).populate([
            { path: "collaborators.user", select: "name" },
            { path: "owner", select: "name" }
        ])
    }

    async getRoomByProjectId(projectId: string): Promise<IRoom> {
        const room = await Room.findOne({ projectId });

        if (!room) {
            return null;
        }

        await room.populate("collaborators.user", "name email");

        return room;
    }

    async getOwnderByRoomId(roomId: string): Promise<string> {
        return (await Room.findOne({ roomId })).owner.toString()
    }

    async findRoomAndUpdateRole(roomId: string, role: "viewer" | "editor", userId: string): Promise<IRoom> {
        return await Room.findOneAndUpdate(
            { roomId, "collaborators.user": userId },
            { $set: { "collaborators.$.role": role } },
            { new: true }
        )
    }

    async findContributerRole(userId: string, projectId: string): Promise<"owner" | "editor" | "viewer"> {
        const room = await Room.findOne({ projectId })

        const collaborator = room.collaborators.find(c => c.user.toString() === userId)
        if (collaborator) {
            return collaborator.role
        }
    }

    async findRoomByProjIdAndDlt(projectId: string): Promise<boolean> {
        const result = await Room.deleteOne({ projectId });
        return result.deletedCount > 0;
    }

    async getProjectIdByRoomId(roomId: string): Promise<IRoom> {
        return (await Room.findOne({ roomId }))
    }
}