import { NextFunction, Request, Response } from "express";
import { IInvitationService } from "../services/interface/IInvitationService";


export class InvitationController {
    constructor(
        private readonly invitationService: IInvitationService
    ) { }

    createInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { senderId, reciverId, roomId } = req.body

            const invitation = await this.invitationService.createInvitation(senderId, reciverId, roomId)

            res.status(201).json({ message: "Invitation created successfully" })

        } catch (error) {
            next(error)
        }
    }
}