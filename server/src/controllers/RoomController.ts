import { NextFunction, Request, Response } from "express";
import { IRoomService } from "../services/interface/IRoomService";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";

export class RoomController {
    constructor(
        private readonly _roomService: IRoomService,
    ) { }

    createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.body;
            const ownerId = req?.user?.id;

            const room = await this._roomService.createRoom(projectId, ownerId);

            const response = new ApiResponse(
                HttpStatusCode.CREATED,
                { roomId: room.roomId },
                "Room created successfully"
            );
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };

    getRoomByProjectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.params;
            const room = await this._roomService.getRoomByProjectId(projectId);

            if (!room) {
                const response = new ApiResponse(HttpStatusCode.NOT_FOUND, null, "Room not found");
                res.status(response.statusCode).json(response);
                return;
            }

            const response = new ApiResponse(HttpStatusCode.OK, room, "Room fetched successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };

    getContributers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.params;
            const room = await this._roomService.getRoomByProjectId(projectId);

            if (!room) {
                const response = new ApiResponse(HttpStatusCode.NOT_FOUND, null, "Room not found");
                res.status(response.statusCode).json(response);
                return;
            }

            const response = new ApiResponse(HttpStatusCode.OK, room.collaborators, "Contributors fetched successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };

    updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { roomId, userId, role } = req.body;

            await this._roomService.updateCollabratorRole(roomId, userId, role);

            const response = new ApiResponse(HttpStatusCode.OK, null, "Role updated successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };

    checkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId, roomId } = req.body;

            const isAllowed: boolean = await this._roomService.isEligibleToEdit(userId, roomId);

            const response = new ApiResponse(HttpStatusCode.OK, { isAllowed }, "Permission check completed");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };

    removeUserFromContributers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId, projectId } = req.body;

            await this._roomService.removeContributer(userId, projectId);

            const response = new ApiResponse(HttpStatusCode.OK, null, "User removed successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };

    getAllContributorsForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const contributors = await this._roomService.getAllContributorsForUser(userId);

            const response = new ApiResponse(HttpStatusCode.OK, contributors, "Contributors fetched successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    };
}
