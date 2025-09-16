import { NextFunction, Request, Response } from "express";
import { IInvitationService } from "../services/interface/IInvitationService";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export class InvitationController {
    constructor(
        private readonly _invitationService: IInvitationService
    ) { }

    createInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { senderId, reciverId, roomId } = req.body

            await this._invitationService.createInvitation(senderId, reciverId, roomId)

            res.status(HttpStatusCode.CREATED).json({ message: "Invitation created successfully" })
        } catch (error) {
            next(error)
        }
    }

    getRecivedInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params

            const recivedInvitation = await this._invitationService.getAllRecivedInvitationByUserId(userId)

            res.status(HttpStatusCode.CREATED).json(recivedInvitation)
        } catch (error) {
            next(error)
        }
    }
}