import { NextFunction, Request, Response } from "express";
import { IInvitationService } from "../services/interface/IInvitationService";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";


export class InvitationController {
    constructor(
        private readonly _invitationService: IInvitationService
    ) { }

    createInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { senderId, reciverId, roomId } = req.body

            await this._invitationService.createInvitation(senderId, reciverId, roomId)

            const response = new ApiResponse(HttpStatusCode.CREATED, null, "Invitation created successfully")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    getRecivedInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params

            const recivedInvitation = await this._invitationService.getAllRecivedInvitationByUserId(userId)

            const response = new ApiResponse(HttpStatusCode.OK, recivedInvitation, "Invitation Fetched successfully")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }
}