import { NextFunction, Request, Response } from "express";
import { IInvitationService } from "../services/interface/IInvitationService";


export class InvitationController {
    constructor(
        private readonly invitationService: IInvitationService
    ) { }

    createInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { senderId, reciverId, roomId } = req.body

            await this.invitationService.createInvitation(senderId, reciverId, roomId)

            res.status(201).json({ message: "Invitation created successfully" })
        } catch (error) {
            next(error)
        }
    }

    getRecivedInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params

            const recivedInvitation = await this.invitationService.getAllRecivedInvitationByUserId(userId)

            res.status(201).json(recivedInvitation)
        } catch (error) {
            next(error)
        }
    }
}