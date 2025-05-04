import { RequestData } from "../../../types/roomTypes";
import { ApproveRequestData, ApproveUserResult, RejectUserResult } from "../../../types/socketType";



export interface IRoomSocketService {
    handleJoinRequest(data: RequestData): Promise<{ requestId: string, ownerSocketId: string } | { error: string }>;
    handleApproveUser(data: ApproveRequestData): Promise<ApproveUserResult>;
    handleRejectUser(data: {requestId:string}): Promise<RejectUserResult>;
}