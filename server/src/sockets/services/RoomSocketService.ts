// src/sockets/services/RoomSocketService.ts
import { IRoomRepository } from '../../repositories/interface/IRoomRepository';
import { RequestData } from '../../types/roomTypes';
import { IUserSocketRepository } from '../repositories/interface/IUserSocketRepository';
import { IRoomSocketService } from './interface/IRoomSocketService';
import { IRequestService } from '../../services/interface/IRequestService';
import { IRequestRepository } from '../../repositories/interface/IRequestRepository';
import { ApproveInvitationResult, ApproveRequestData, ApproveUserResult, RejectUserResult } from '../../types/socketType';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { IMailService } from '../../services/interface/IMailService';
import { IProjectRepository } from '../../repositories/interface/IProjectRepository';
import { IInvitationRepository } from '../../repositories/interface/IInvitationRepository';

export class RoomSocketService implements IRoomSocketService {
    constructor(
        private readonly roomRepository: IRoomRepository,
        private readonly requestService: IRequestService,
        private readonly requestRepository: IRequestRepository,
        private readonly userSocketRepository: IUserSocketRepository,
        private readonly userRepository: IUserRepository,
        private readonly mailService: IMailService,
        private readonly projectRepository: IProjectRepository,
        private readonly invitationRepository: IInvitationRepository,
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

        const ownderId = room.owner.toString()
        const getOwnderDetails = await this.userRepository.findById(ownderId)

        const sender = (await this.userRepository.findById(userId)).email
        const projectName = (await this.projectRepository.findById((room.projectId).toString())).projectName
        await this.mailService.sendJoinRequest(getOwnderDetails.email, sender, projectName)


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

    async handleRejectUser(data: { requestId: string }): Promise<RejectUserResult> {

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

    async handleApproveInvitation(data: { invitationId: string; roomId: string; }): Promise<ApproveInvitationResult> {
        const invitation = await this.invitationRepository.findById(data.invitationId)
        const senderId = invitation.senderId.toString()
        const reciverId = invitation.reciverId.toString()

        const reciverName = (await this.userRepository.findById(reciverId)).name

        const updatedRoom = await this.invitationRepository.updateStatus(invitation._id as string, "accepted")

        if (!updatedRoom) {
            return { success: false, error: "Failed to update room." };
        }

        return {
            success: true,
            senderId,
            roomId: invitation.roomId,
            reciverName,
        };
    }

    async handleRejectInvitation(data: { invitationId: string; }): Promise<ApproveInvitationResult> {
        const invitation = await this.invitationRepository.findById(data.invitationId)
        const senderId = invitation.senderId.toString()
        const reciverId = invitation.reciverId.toString()

        const reciverName = (await this.userRepository.findById(reciverId)).name

        const updatedRoom = await this.invitationRepository.updateStatus(invitation._id as string, "rejected")

        if (!updatedRoom) {
            return { success: false, error: "Failed to update room." };
        }

        return {
            success: true,
            senderId,
            roomId: invitation.roomId,
            reciverName,
        };
    }
}