import RequestModel from "../models/requestModel";
import { IMakeRequest } from "../types/requestType";

class RequestRepositories {
    async makeRequest(data: IMakeRequest) {
        const { senderId, roomId, reciverId } = data
        return await RequestModel.create({ senderId, roomId, reciverId })
    }

    async updateRequestStatus(status: "accepted" | "rejected", id: string) {
        return await RequestModel.findByIdAndUpdate(
            id, { status }, { new: true });
    }

    async getAllSendedRequest(id: string) {
        return await RequestModel.find({ senderId: id, status: "pending" }, "reciverId roomId").populate("reciverId", "name");
    }

    async getRecivedRequest(userId: string) {
        return await RequestModel.find({ reciverId: userId, status: "pending" }, "senderId roomId").populate("senderId", "name");
    }

    async findRequestByUserAndRoom(userId, roomId) {
        return await RequestModel.findOne({ senderId: userId, roomId });
    }

    async getRequestById(id: string) {
        return await RequestModel.findById(id)
    }
}

export const requestRepo = new RequestRepositories()