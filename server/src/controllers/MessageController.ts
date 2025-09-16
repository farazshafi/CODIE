import { NextFunction, Request, Response } from "express";
import { IMessageService } from "../services/interface/IMessageService";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export class MessageController {
    constructor(
        private readonly _messageService: IMessageService
    ) { }

    createMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const message = await this._messageService.createMessage(req.body);
            res.status(HttpStatusCode.CREATED).json(message);
        } catch (err) {
            next(err)
        }
    }

    getByRoomId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const messages = await this._messageService.getMessagesForRoom(req.params.roomId);
            res.status(HttpStatusCode.OK).json(messages);
        } catch (err) {
            next(err)
        }
    }
}