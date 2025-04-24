import RequestModel from "../models/requestModel";
import { IMakeRequest } from "../types/requestType";

class RequestRepositories {
    async makeRequest(data: IMakeRequest) {
        const { senderId, roomId, reciverId } = data
        return await RequestModel.create({ senderId, roomId, reciverId })
    }

    async getAllRequestByUserId(id: string) {
        return await RequestModel.find({ senderId: id }).populate("reciverId", "name")
    }

    async getRecivedRequest(userId: string) {
        return await RequestModel.find({ reciverId: userId }).populate("senderId","name")
    }
}

export const requestRepo = new RequestRepositories()