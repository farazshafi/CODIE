import { Request, Response, NextFunction } from "express";
import { requestService } from "../services/requestServices";


export const getAllSendedReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const data = await requestService.getAllSendedRequest(id)


        res.status(201).json({
            data
        });
    } catch (err) {
        next(err)
    }
}


export const getAllRecivedRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const data = await requestService.getAllRecivedRequest(id)
        console.log("recived datas: ", data)

        res.status(201).json(data);
    } catch (err) {
        next(err)
    }
}