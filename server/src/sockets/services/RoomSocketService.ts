// src/sockets/services/RoomSocketService.ts
import { IRoomRepository } from '../../repositories/interface/IRoomRepository';
import { RequestData } from '../../types/roomTypes';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';
import { IRoomSocketService } from './interface/IRoomSocketService';
import { IRequestService } from '../../services/interface/IRequestService';
import { IRequestRepository } from '../../repositories/interface/IRequestRepository';
import { ApproveRequestData, ApproveUserResult, RejectUserResult } from '../../types/socketType';

export class RoomSocketService implements IRoomSocketService {
    constructor(
        private readonly roomRepository: IRoomRepository,
        private readonly requestService: IRequestService,
        private readonly requestRepository: IRequestRepository,
        private readonly userSocketRepository: IUserSocketRepository
    ) { }

    async handleJoinRequest(data: RequestData): Promise<{ requestId: string, ownerSocketId: string } | { error: string }> {
        const { roomId, userId } = data;

        const room = await this.roomRepository.findRoomById(roomId);
        if (!room) {
            return { error: "Room not found" };
        }


        const existingRequest = await this.requestRepository.findRequestByUserAndRoom(userId, roomId);
        if (existingRequest) {
            return { error: "You have already sent a request to join this room." };
        }

        const request = await this.requestService.createRequest({
            roomId,
            senderId: userId
        });

        const ownerSocketId = this.userSocketRepository.getSocketId(room.owner.toString());

        return {
            requestId: request._id as string,
            ownerSocketId
        };
    }

    async handleApproveUser(data: ApproveRequestData): Promise<ApproveUserResult> {
        const room = await this.roomRepository.findRoomById(data.roomId);
        if (!room) {
            return { success: false, error: "Room not found!" };
        }

        const request = await this.requestRepository.getRequestById(data.requestId);
        if (!request || request.roomId.toString() !== data.roomId) {
            return { success: false, error: "Invalid request!" };
        }

        const requestedUser = request.senderId.toString();

        if (room.collaborators.some(c => c.user?.toString() === requestedUser)) {
            return { success: false, error: "User is already a collaborator." };
        }

        const updatedRoom = await this.roomRepository.addUserToCollabrators(
            requestedUser,
            data.roomId
        );


        await this.requestRepository.updateRequestStatus(
            "accepted",
            data.requestId,
        );

        if (!updatedRoom) {
            return { success: false, error: "Failed to update room." };
        }

        return {
            success: true,
            approvedUserId: requestedUser,
            roomId: data.roomId
        };
    }

    async handleRejectUser(data: {requestId:string}): Promise<RejectUserResult> {

        const request = await this.requestRepository.getRequestById(data.requestId);
        const requestedUser = request.senderId.toString();


        const updatedRoom = await this.requestRepository.updateRequestStatus(
            "rejected",
            data.requestId,
        );

        if (!updatedRoom) {
            return { success: false, error: "Failed to update room." };
        }

        return {
            success: true,
            rejectedUserId: requestedUser,
        };
    }
}