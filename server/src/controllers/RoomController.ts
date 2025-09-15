import { NextFunction, Request, Response } from "express";
import { IRoomService } from "../services/interface/IRoomService";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export class RoomController {
    constructor(
        private readonly roomService: IRoomService,
    ) { }

    createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.body
            const ownderId = req?.user?.id

            const room = await this.roomService.createRoom(projectId, ownderId)
            res.status(HttpStatusCode.CREATED).json({
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

    getRoomByProjectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.params
            const room = await this.roomService.getRoomByProjectId(projectId)

            if (!room) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "Room Not Found" })
                return
            }

            res.status(HttpStatusCode.OK).json({
                status: 'success',
                data: room
            });
        } catch (error) {
            next(error)
        }
    }

    getContributers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.params
            const room = await this.roomService.getRoomByProjectId(projectId)

            if (!room) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "Room Not Found" })
                return
            }

            res.status(HttpStatusCode.OK).json({
                status: 'success',
                data: room.collaborators
            });
        } catch (error) {
            next(error)
        }
    }

    updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { roomId, userId, role } = req.body

            await this.roomService.updateCollabratorRole(roomId, userId, role)

            res.status(HttpStatusCode.OK).json({
                status: 'success',
                message: "successfully updated role"
            });
        } catch (error) {
            next(error)
        }
    }

    checkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId, roomId } = req.body

            const isEligibleToEdit: boolean = await this.roomService.isEligibleToEdit(userId, roomId)
            console.log("check permision is Eligible, ", isEligibleToEdit)

            res.status(HttpStatusCode.OK).json({ isAllowed: isEligibleToEdit })

        } catch (error) {
            next(error)
        }
    }

    removeUserFromContributers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId, projectId } = req.body

            await this.roomService.removeContributer(userId, projectId)

            res.status(HttpStatusCode.OK).json({ message: "You successfully removed" })

        } catch (error) {
            next(error)
        }
    }

    getAllContributorsForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id
            const contributers = await this.roomService.getAllContributorsForUser(userId)

            res.status(HttpStatusCode.OK).json(contributers)

        } catch (error) {
            next(error)
        }
    }
}