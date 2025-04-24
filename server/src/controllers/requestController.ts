import { Request, Response, NextFunction } from "express";
import { requestService } from "../services/requestServices";


export const getAllRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const data = await requestService.getAllJoinReqByUserId(id)

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

        res.status(201).json({
            data
        });
    } catch (err) {
        next(err)
    }
}