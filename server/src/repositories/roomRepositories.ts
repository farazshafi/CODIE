import Room from "../models/roomModel"
import { CreateRoomType } from "../types/roomType"

class RoomRepositories {
    async createRoom({ roomId, projectId, ownerId }: CreateRoomType) {
        return await Room.create({
            roomId,
            projectId,
            owner: ownerId,
            collaborators: [{ user: ownerId, role: "owner" }]
        })
    }

    async findRoomById(roomId: string) {
        return await Room.findOne({ roomId }).populate("collaborators.user")
    }

    async addUserToCollabrators(userId: string, roomId: string) {
        return await Room.findOneAndUpdate(
            { roomId },
            { $addToSet: { collaborators: { user: userId, role: "viewer" } } },
            { new: true }
        ).populate("collaborators.user", "name")
    }

    async getRoomByProjectId(projectId: string) {
        return (await Room.findOne({projectId})).populate("collaborators.user","name")
    }
}

export const roomRepositories = new RoomRepositories()