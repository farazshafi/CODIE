import { NextFunction, Request, Response } from "express";
import { IDiscoverService } from "../services/interface/IDiscoverService";
import mongoose from "mongoose";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export class DiscoverController {
    constructor(
        private readonly _discoverService: IDiscoverService,
    ) { }

    shareToDiscover = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const { projectId } = req.body
            if (!projectId) res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Project Id is Required" })

            await this._discoverService.create(new mongoose.Types.ObjectId(projectId), userId)
            res.status(HttpStatusCode.CREATED).json({ message: "Shared to Discover" })
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

            res.status(HttpStatusCode.OK).json({ discoveries })
        } catch (error) {
            next(error)
        }
    }

    removeDiscover = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            await this._discoverService.removeProject(id)

            res.status(HttpStatusCode.OK).json({ message: "removed from discovery" })
        } catch (error) {
            next(error)
        }
    }

    generateExplanation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code }: { code: string } = req.body
            const userId = req.user.id

            const explanation = await this._discoverService.getCodeExplanation(code, userId)
            res.status(HttpStatusCode.OK).json(explanation)
        } catch (error) {
            next(error)
        }
    }
}