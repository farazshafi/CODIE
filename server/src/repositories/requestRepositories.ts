import { Model } from "mongoose";
import RequestModel, { IRequest } from "../models/requestModel";
import { IMakeRequest } from "../types/requestType";
import { IRequestRepository } from "./interface/IRequestRepository";
import { BaseRepository } from "./baseRepository";

export class RequestRepositories extends BaseRepository<IRequest> implements IRequestRepository {

    constructor(model: Model<IRequest>) {
        super(model)
    }

    async makeRequest(data: IMakeRequest): Promise<IRequest> {
        const { senderId, roomId, reciverId } = data
        return await RequestModel.create({ senderId, roomId, reciverId })
    }

    async updateRequestStatus(status: "accepted" | "rejected", id: string): Promise<IRequest> {
        return await RequestModel.findByIdAndUpdate(
            id, { status }, { new: true });
    }

    async getAllSendedRequest(id: string): Promise<IRequest[]> {
        return await RequestModel.find({ senderId: id, status: "pending" }, "reciverId roomId").populate("reciverId", "name");
    }

    async getRecivedRequest(userId: string): Promise<IRequest[]> {
        return await RequestModel.find({ reciverId: userId, status: "pending" }, "senderId roomId").populate("senderId", "name");
    }

    async findRequestByUserAndRoom(userId: string, roomId: string): Promise<IRequest> {
        return await RequestModel.findOne({ senderId: userId, roomId });
    }

    async getRequestById(id: string): Promise<IRequest> {
        return await RequestModel.findById(id)
    }
}