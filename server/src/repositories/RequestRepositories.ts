import { Model } from "mongoose";
import { IRequest } from "../models/RequestModel";
import { IMakeRequest } from "../types/requestType";
import { IRequestRepository } from "./interface/IRequestRepository";
import { BaseRepository } from "./BaseRepository";

export class RequestRepositories extends BaseRepository<IRequest> implements IRequestRepository {

    constructor(model: Model<IRequest>) {
        super(model)
    }

    async makeRequest(data: IMakeRequest): Promise<IRequest> {
        const { senderId, roomId, reciverId } = data
        return await this.model.create({ senderId, roomId, reciverId })
    }

    async updateRequestStatus(status: "accepted" | "rejected", id: string): Promise<IRequest | null> {
        const update: Partial<IRequest> & { statusChangedAt?: Date | null } = {
            status,
            statusChangedAt: new Date()
        };

        return await this.model.findByIdAndUpdate(id, update, { new: true });
    }


    async getAllSendedRequest(id: string): Promise<IRequest[]> {
        return await this.model.find({ senderId: id, status: "pending" }, "reciverId roomId").populate("reciverId", "name");
    }

    async getRecivedRequest(userId: string): Promise<IRequest[]> {
        return await this.model.find({ reciverId: userId, status: "pending" }, "senderId roomId").populate("senderId", "name");
    }

    async findRequestByUserAndRoom(userId: string, roomId: string): Promise<IRequest | null> {
        return await this.model.findOne({ senderId: userId, roomId });
    }

    async getRequestById(id: string): Promise<IRequest | null> {
        return await this.model.findById(id)
    }

    async getRequestsByRoomId(roomId: string): Promise<IRequest[]> {
        return await this.model.find({ roomId, status: "pending" }).populate("senderId", "name email");
    }

}
