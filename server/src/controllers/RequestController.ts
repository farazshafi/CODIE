import { Request, Response, NextFunction } from "express";
import { IRequestService } from "../services/interface/IRequestService";


export class RequestController {
    constructor(private readonly requestService: IRequestService) { }

    getAllSendedReq = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const data = await this.requestService.getAllSendedRequest(id)
            res.status(201).json({
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
            res.status(201).json(data);
        } catch (err) {
            next(err)
        }
    }

    getRequetsByRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { roomId } = req.params
            const data = await this.requestService.getAllRequetByRoomId(roomId)


            const formattedData = data.map((request) => ({
                id: request._id,
                senderId: request.senderId._id,
                name: (request.senderId as any).name,
                email: (request.senderId as any).email
            }))

            res.status(201).json(formattedData);
        } catch (err) {
            next(err)
        }
    }
}