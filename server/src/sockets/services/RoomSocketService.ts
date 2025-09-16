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
import { IUserSubscriptionRepository } from '../../repositories/interface/IUserSubscriptionRepository';
import { ISubscriptionRepository } from '../../repositories/interface/ISubscriptionRepository';

export class RoomSocketService implements IRoomSocketService {
    constructor(
        private readonly _roomRepository: IRoomRepository,
        private readonly _requestService: IRequestService,
        private readonly _requestRepository: IRequestRepository,
        private readonly _userSocketRepository: IUserSocketRepository,
        private readonly _userRepository: IUserRepository,
        private readonly _mailService: IMailService,
        private readonly _projectRepository: IProjectRepository,
        private readonly _invitationRepository: IInvitationRepository,
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        private readonly _subscriptionRepository: ISubscriptionRepository,
    ) { }

    async handleJoinRequest(data: RequestData): Promise<{ requestId: string, ownerSocketId: string } | { error: string }> {
        const { roomId, userId } = data;

        const room = await this._roomRepository.findRoomById(roomId);
        if (!room) {
            return { error: "Room not found" };
        }

        const existingRequest = await this._requestRepository.findRequestByUserAndRoom(userId, roomId);
        if (existingRequest) {
            return { error: "You have already sent a request to join this room." };
        }


        console.log("comming herere".bgGreen)
        const currentContributers = room.collaborators.length - 1
        const userSubscriptionId = (await this._userSubscriptionRepository.findOne({ userId: room.owner })).planId.toString()
        const maxContributers = (await this._subscriptionRepository.findById(userSubscriptionId)).maxCollaborators
        if (currentContributers >= maxContributers) {
            console.log("room is full".bgRed)
            return { error: "Room is full" } 
        }

        const request = await this._requestService.createRequest({
            roomId,
            senderId: userId
        });

        const ownderId = room.owner.toString()
        const getOwnderDetails = await this._userRepository.findById(ownderId)

        const sender = (await this._userRepository.findById(userId)).email
        const projectName = (await this._projectRepository.findById((room.projectId).toString())).projectName
        await this._mailService.sendJoinRequest(getOwnderDetails.email, sender, projectName)


        const ownerSocketId = await this._userSocketRepository.getSocketId(room.owner.toString());
        return {
            requestId: request._id as string,
            ownerSocketId
        };
    }

    async handleApproveUser(data: ApproveRequestData): Promise<ApproveUserResult> {
        const room = await this._roomRepository.findRoomById(data.roomId);
        if (!room) {
            return { success: false, error: "Room not found!" };
        }

        const request = await this._requestRepository.getRequestById(data.requestId);
        if (!request || request.roomId.toString() !== data.roomId) {
            return { success: false, error: "Invalid request!" };
        }

        const requestedUser = request.senderId.toString();

        if (room.collaborators.some(c => c.user?.toString() === requestedUser)) {
            return { success: false, error: "User is already a collaborator." };
        }

        const updatedRoom = await this._roomRepository.addUserToCollabrators(
            requestedUser,
            data.roomId
        );


        await this._requestRepository.updateRequestStatus(
            "accepted",
            data.requestId,
        );

        if (!updatedRoom) {
            return { success: false, error: "Failed to update room." };
        }

        return {
            success: true,
            approvedUserId: requestedUser,
            roomId: data.roomId,
            projectId: room.projectId.toString()
        };
    }

    async handleRejectUser(data: { requestId: string }): Promise<RejectUserResult> {

        const request = await this._requestRepository.getRequestById(data.requestId);
        const requestedUser = request.senderId.toString();


        const updatedRoom = await this._requestRepository.updateRequestStatus(
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
        const invitation = await this._invitationRepository.findById(data.invitationId)
        const senderId = invitation.senderId.toString()
        const reciverId = invitation.reciverId.toString()
        const reciverName = (await this._userRepository.findById(reciverId)).name

        const addUser = await this._roomRepository.addUserToCollabrators(reciverId, data.roomId)
        if (!addUser) {
            return { success: false, error: "Failed to add user to collabration" }
        }

        const updatedRoom = await this._invitationRepository.updateStatus(invitation._id as string, "accepted")
        const projectId = await (await this._roomRepository.getProjectIdByRoomId(invitation.roomId)).projectId.toString()
        if (!updatedRoom) {
            return { success: false, error: "Failed to update room." };
        }

        return {
            success: true,
            senderId,
            roomId: invitation.roomId,
            reciverName,
            projectId: projectId
        };
    }

    async handleRejectInvitation(data: { invitationId: string; }): Promise<ApproveInvitationResult> {
        const invitation = await this._invitationRepository.findById(data.invitationId)
        const senderId = invitation.senderId.toString()
        const reciverId = invitation.reciverId.toString()

        const reciverName = (await this._userRepository.findById(reciverId)).name

        const updatedRoom = await this._invitationRepository.updateStatus(invitation._id as string, "rejected")

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