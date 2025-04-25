import { send } from "process";
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

    async getAllSendedRequest(id: string) {
        try {
            const data = await requestRepo.getAllSendedRequest(id)
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

    async getRequestedUser(reqId: string, type: "sender" | "reciver") {
        try {
            const request = await requestRepo.getRequestById(reqId)
            
            if (!request) {
                throw new HttpError(404, "Request not found");
            }
            if (type === "sender") {
                return request.senderId.toString();
            } else {
                return request.reciverId.toString();
            }
        } catch (err) {
            if (err instanceof HttpError) {
                throw err;
            }
            throw new HttpError(500, "An Error occurred while getting requested user");
        }
    }



}

export const requestService = new RequestService()