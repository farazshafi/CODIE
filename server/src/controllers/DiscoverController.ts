import { NextFunction, Request, Response } from "express";
import { IDiscoverService } from "../services/interface/IDiscoverService";
import mongoose from "mongoose";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";


export class DiscoverController {
    constructor(
        private readonly _discoverService: IDiscoverService,
    ) { }

    shareToDiscover = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const { projectId } = req.body
            if (!projectId) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "Project Id is required")
                res.status(response.statusCode).json(response)
            }

            await this._discoverService.create(new mongoose.Types.ObjectId(projectId), userId)
            const response = new ApiResponse(HttpStatusCode.CREATED, null, "Shared to Discover")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    findDiscoveries = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { keyword = "", language = "", page = '1', limit = "6" } = req.query

            const filter = {
                keyword: String(keyword),
                language: String(language)
            }

            const pagination = {
                limit: parseInt(limit as string),
                page: parseInt(page as string)
            }

            const discoveries = await this._discoverService.findDiscoveries(filter, pagination)

            const response = new ApiResponse(HttpStatusCode.OK, discoveries, "Discovery succesfully founded")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    removeDiscover = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            await this._discoverService.removeProject(id)

            const response = new ApiResponse(HttpStatusCode.OK, null, "Removed From Discovery")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    generateExplanation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code }: { code: string } = req.body
            const userId = req.user.id

            const explanation = await this._discoverService.getCodeExplanation(code, userId)
            const response = new ApiResponse(HttpStatusCode.OK, explanation, "Generated explanation succesfully")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }
}