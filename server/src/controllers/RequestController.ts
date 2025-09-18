import { Request, Response, NextFunction } from "express";
import { IRequestService } from "../services/interface/IRequestService";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";


export class RequestController {
    constructor(private readonly _requestService: IRequestService) { }

    getAllSendedReq = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const data = await this._requestService.getAllSendedRequest(id)
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found all Sended request")
            res.status(response.statusCode).json(response)
        } catch (err) {
            next(err)
        }
    }

    getAllRecivedRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const data = await this._requestService.getAllRecivedRequest(id)
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found all recived request")
            res.status(response.statusCode).json(response)
        } catch (err) {
            next(err)
        }
    }

    getRequetsByRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { roomId } = req.params;
            const data = await this._requestService.getAllRequetByRoomId(roomId);

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

            const response = new ApiResponse(HttpStatusCode.OK, formattedData, "Found all request in a room")
            res.status(response.statusCode).json(response)
        } catch (err) {
            next(err);
        }
    }
}