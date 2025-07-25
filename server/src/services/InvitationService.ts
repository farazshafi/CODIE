import mongoose from "mongoose";
import { IInvitation } from "../models/InvitationModel";
import { IInvitationRepository } from "../repositories/interface/IInvitationRepository";
import { IInvitationService } from "./interface/IInvitationService";
import { HttpError } from "../utils/HttpError";
import { IMailService } from "./interface/IMailService";
import { IUserRepository } from "../repositories/interface/IUserRepository";
import { IRoomRepository } from "../repositories/interface/IRoomRepository";
import { IUserSubscriptionRepository } from "../repositories/interface/IUserSubscriptionRepository";
import { ISubscriptionRepository } from "../repositories/interface/ISubscriptionRepository";


export class InvitationService implements IInvitationService {
    constructor(
        private readonly invitationRepository: IInvitationRepository,
        private readonly mailService: IMailService,
        private readonly userRepository: IUserRepository,
        private readonly roomRepository: IRoomRepository,
        private readonly userSubscriptionRepository: IUserSubscriptionRepository,
        private readonly subscriptionRepository: ISubscriptionRepository,
    ) { }

    async createInvitation(senderId: string, reciverId: string, roomId: string): Promise<IInvitation> {
        try {
            const invitation = {
                senderId: new mongoose.Types.ObjectId(senderId),
                reciverId: new mongoose.Types.ObjectId(reciverId),
                roomId,
            }

            const isExist = await this.isInvitaionExist(reciverId, roomId)
            if (isExist) {
                throw new HttpError(400, "Already sended Invitation.");
            }

            const room = await this.roomRepository.findOne({ roomId })
            const currentContributers = room.collaborators.length - 1
            const userSubscriptionId = (await this.userSubscriptionRepository.findOne({ userId: room.owner })).planId.toString()
            const maxContributers = (await this.subscriptionRepository.findById(userSubscriptionId)).maxCollaborators
            if (currentContributers >= maxContributers) {
                throw new HttpError(400, "Maximum number of collaborators reached for this room. Please upgrade your plan");
            }

            const reciverMail = (await this.userRepository.findById(reciverId)).email
            const senderName = (await this.userRepository.findById(senderId)).name

            await this.mailService.sendInvitation(reciverMail, senderName)

            return await this.invitationRepository.create(invitation)
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log("Error while creating invitation", error)
            throw new HttpError(500, "Error while creating invitation")
        }

    }

    async isInvitaionExist(reciverId: string, roomId: string): Promise<boolean> {
        const isExist = await this.invitationRepository.findOne({ reciverId: new mongoose.Types.ObjectId(reciverId), roomId });
        return !!isExist;
    }

    async getAllRecivedInvitationByUserId(userId: string): Promise<IInvitation[]> {
        try {
            const data = await this.invitationRepository.getAllRecivedInvitations(userId)
            return data
        } catch (error) {
            console.log("Cannot get Recived Invitations", error)
            throw new HttpError(500, "Cannot get Recived Invitations")
        }
    }
}