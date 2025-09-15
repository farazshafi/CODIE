import { Request, Response, NextFunction } from "express";
import { IRequestService } from "../services/interface/IRequestService";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export class RequestController {
    constructor(private readonly requestService: IRequestService) { }

    getAllSendedReq = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const data = await this.requestService.getAllSendedRequest(id)
            res.status(HttpStatusCode.CREATED).json({
                data
            });
        } catch (err) {
            next(err)
        }
    }

    getAllRecivedRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const data = await this.requestService.getAllRecivedRequest(id)
            res.status(HttpStatusCode.CREATED).json(data);
        } catch (err) {
            next(err)
        }
    }

    getRequetsByRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { roomId } = req.params;
        const data = await this.requestService.getAllRequetByRoomId(roomId);

        const formattedData = data.map((request) => {
            const sender =
                typeof request.senderId === "object" &&
                request.senderId !== null &&
                "name" in request.senderId &&
                "email" in request.senderId
                    ? request.senderId
                    : { _id: request.senderId, name: "", email: "" };

            return {
                id: request._id,
                senderId: sender._id,
                name: sender.name,
                email: sender.email,
            };
        });

        res.status(HttpStatusCode.CREATED).json(formattedData);
    } catch (err) {
        next(err);
    }
}
}