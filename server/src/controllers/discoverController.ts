import { NextFunction, Request, Response } from "express";
import { IDiscoverService } from "../services/interface/IDiscoverService";
import mongoose from "mongoose";
import { string } from "zod";


export class DiscoverController {
    constructor(
        private readonly discoverService: IDiscoverService,
    ) { }

    shareToDiscover = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { projectId } = req.body
            if (!projectId) res.status(400).json({ message: "Project Id is Required" })

            await this.discoverService.create(new mongoose.Types.ObjectId(projectId))
            res.status(201).json({ message: "Shared to Discover" })
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

            const discoveries = await this.discoverService.findDiscoveries(filter, pagination)

            res.status(200).json({ discoveries })
        } catch (error) {
            next(error)
        }
    }

    removeDiscover = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            await this.discoverService.removeProject(id)

            res.status(200).json({ message: "removed from discovery" })
        } catch (error) {
            next(error)
        }
    }
}