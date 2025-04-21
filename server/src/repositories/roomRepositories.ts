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
}

export const roomRepositories = new RoomRepositories()