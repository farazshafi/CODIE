import { requestRepo } from "../repositories/requestRepositories";
import { roomRepositories } from "../repositories/roomRepositories";
import { HttpError } from "../utils/HttpError";

class RequestService {

    async createRequest(data: { roomId, senderId }) {
        try {
            const { roomId, senderId } = data

            const reciverId = await roomRepositories.getOwnderByRoomId(roomId)
            if (!reciverId) {
                throw new HttpError(404, "Room Not Found when creating request")
            }

            return await requestRepo.makeRequest({ roomId, senderId, reciverId })

        } catch (err) {
            if (err instanceof HttpError) {
                throw err;
            }
            throw new HttpError(500, "An Error occurred while creating request");
        }
    }

    async getAllJoinReqByUserId(id: string) {
        try {
            const data = await requestRepo.getAllRequestByUserId(id)
            if (!data) {
                throw new HttpError(404, "No request Founded")
            }
            return data

        } catch (err) {
            if (err instanceof HttpError) {
                throw err;
            }
            throw new HttpError(500, "An Error occurred while getting sended request");
        }
    }

    async getAllRecivedRequest(userId: string) {
        try {
            const data = await requestRepo.getRecivedRequest(userId)
            if (!data) {
                throw new HttpError(404, "No request Founded")
            }
            return data

        } catch (err) {
            if (err instanceof HttpError) {
                throw err;
            }
            throw new HttpError(500, "An Error occurred while geting recived request");
        }
    }



}

export const requestService = new RequestService()