import { IRequest } from "../../models/requestModel";
import { IMakeRequest } from "../../types/requestType";


export interface IRequestRepository {
    makeRequest(data: IMakeRequest): Promise<IRequest>;
    updateRequestStatus(status: "accepted" | "rejected", id: string): Promise<IRequest>;
    getAllSendedRequest(id: string): Promise<IRequest[]>;
    getRecivedRequest(userId: string): Promise<IRequest[]>;
    findRequestByUserAndRoom(userId: string, roomId: string): Promise<IRequest>;
    getRequestById(id: string): Promise<IRequest>;
}