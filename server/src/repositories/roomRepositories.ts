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
        return (await Room.findOne({ projectId })).populate("collaborators.user", "name")
    }

    async getOwnderByRoomId(roomId: string): Promise<string> {
        return (await Room.findOne({ roomId })).owner.toString()
    }
}