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
                projectId: room.projectId,
                owner: room.owner,
                members: room.collaborators,
                createdAt: room.createdAt
            }
        });

    } catch (error) {
        next(error)
    }
}