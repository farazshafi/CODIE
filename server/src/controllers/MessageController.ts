import { NextFunction, Request, Response } from "express";
import { IMessageService } from "../services/interface/IMessageService";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";

export class MessageController {
    constructor(
        private readonly _messageService: IMessageService
    ) { }

    createMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const message = await this._messageService.createMessage(req.body);

            const response = new ApiResponse(HttpStatusCode.CREATED, message, "Message created successfully");
            res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }

    getByRoomId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const messages = await this._messageService.getMessagesForRoom(req.params.roomId);

            const response = new ApiResponse(HttpStatusCode.OK, messages, "Fetched messages for room successfully");
            res.status(response.statusCode).json(response);
        } catch (err) {
            next(err);
        }
    }
}
