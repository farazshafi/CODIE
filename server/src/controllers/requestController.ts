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
}