import { roomRepositories } from "../repositories/roomRepositories"
import { CreateRoomType } from "../types/roomType"
import { generateRoomId } from "../utils/generateRoomId"
import { HttpError } from "../utils/HttpError"

class RoomServices {
    async createRoom(projectId: string, ownerId: string) {
        try {
            let roomId = generateRoomId()
            const roomData: CreateRoomType = {
                projectId,
                ownerId,
                roomId
            }
            let existRoom = await roomRepositories.findRoomById(roomId)

            while (existRoom) {
                roomId = generateRoomId();
                existRoom = await roomRepositories.findRoomById(roomId);
            }

            return await roomRepositories.createRoom(roomData)
        } catch (err) {
            console.error("Failed when creating room: ",err)
            throw new HttpError(500, "Failed to create room")
        }
    }
}

export const roomServices = new RoomServices()