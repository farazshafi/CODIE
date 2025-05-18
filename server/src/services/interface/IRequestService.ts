import { IRequest } from "../../models/requestModel";


export interface IRequestService {
    createRequest(data: { roomId: string, senderId: string }): Promise<IRequest>;
    getAllSendedRequest(id: string): Promise<IRequest[]>;
    getAllRecivedRequest(userId: string): Promise<IRequest[]>;
    getRequestedUser(reqId: string, type: "sender" | "reciver"): Promise<string>;
    getAllRequetByRoomId(roomId: string): Promise<IRequest[]>;
}