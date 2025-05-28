import { NextFunction, Request, Response } from "express";
import { IMessageService } from "../services/interface/IMessageService";


export class MessageController {
    constructor(
        private readonly messageService: IMessageService
    ) { }

    createMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const message = await this.messageService.createMessage(req.body);
            res.status(201).json(message);
        } catch (err) {
            next(err)
        }
    }

    getByRoomId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const messages = await this.messageService.getMessagesForRoom(req.params.roomId);
            res.status(200).json(messages);
        } catch (err) {
            next(err)
        }
    }
}