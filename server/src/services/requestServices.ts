import { HttpError } from "../utils/HttpError";
import { IRequestRepository } from "../repositories/interface/IRequestRepository";
import { IRequest } from "../models/requestModel";
import { IRequestService } from "./interface/IRequestService";
import { IRoomRepository } from "../repositories/interface/IRoomRepository";

export class RequestService implements IRequestService {
    constructor(
        private readonly requestRepository: IRequestRepository,
        private readonly roomRepositories: IRoomRepository
    ) { }

    async createRequest(data: { roomId: string, senderId: string }): Promise<IRequest> {
        try {
            const { roomId, senderId } = data
            const reciverId = await this.roomRepositories.getOwnderByRoomId(roomId)
            if (!reciverId) {
                throw new HttpError(404, "Room Not Found when creating request")
            }


            return await this.requestRepository.makeRequest({ roomId, senderId, reciverId })

        } catch (err) {
            if (err instanceof HttpError) {
                throw err;
            }
            throw new HttpError(500, "An Error occurred while creating request");
        }
    }

    async getAllSendedRequest(id: string): Promise<IRequest[]> {
        try {
            const data = await this.requestRepository.getAllSendedRequest(id)
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

    async getAllRecivedRequest(userId: string): Promise<IRequest[]> {
        try {
            const data = await this.requestRepository.getRecivedRequest(userId)
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

    async getRequestedUser(reqId: string, type: "sender" | "reciver"): Promise<string> {
        try {
            const request = await this.requestRepository.getRequestById(reqId)

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

    async getAllRequetByRoomId(roomId: string): Promise<IRequest[]> {
        try {
            const data = await this.requestRepository.getRequestsByRoomId(roomId)
            if (!data) {
                throw new HttpError(404, "Requets not found")
            }
            return data
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Error while getting all requests by roomID")
        }
    }

}