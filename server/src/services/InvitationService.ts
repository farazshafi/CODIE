import mongoose from "mongoose";
import { IInvitation } from "../models/InvitationModel";
import { IInvitationRepository } from "../repositories/interface/IInvitationRepository";
import { IInvitationService } from "./interface/IInvitationService";
import { HttpError } from "../utils/HttpError";
import { IMailService } from "./interface/IMailService";
import { IUserRepository } from "../repositories/interface/IUserRepository";


export class InvitationService implements IInvitationService {
    constructor(
        private readonly invitationRepository: IInvitationRepository,
        private readonly mailService: IMailService,
        private readonly userRepository: IUserRepository
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