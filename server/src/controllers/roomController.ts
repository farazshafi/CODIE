import { NextFunction, Request, Response } from "express";
import { roomServices } from "../services/roomServices";


export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { projectId } = req.body
        const ownderId = req?.user?.id

        const room = await roomServices.createRoom(projectId, ownderId)

        res.status(201).json({
            status: 'success',
            message: 'Room created successfully',
            data: {
                roomId: room.roomId,
            }
        });

    } catch (error) {
        next(error)
    }
}

export const getRoomByProjectId = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { projectId } = req.params

        const room = await roomServices.getRoomByProjectId(projectId)

        res.status(201).json({
            status: 'success',
            data: room
        });

    } catch (error) {
        next(error)
    }
}