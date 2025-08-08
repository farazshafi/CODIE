import { NextFunction, Request, Response } from "express";
import { IStarredService } from "../services/interface/IStarredService";


export class StarredController {
    constructor(
        private readonly starredService: IStarredService,
    ) { }

    getStarredSnippets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const starredSnippets = await this.starredService.getUserStarredSnippets(userId)

            res.status(200).json(starredSnippets)
        } catch (error) {
            next(error)
        }
    }

    starASnippet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const { projectId } = req.body
            const starredSnippets = await this.starredService.starASnippet(userId, projectId)

            res.status(200).json(starredSnippets)
        } catch (error) {
            next(error)
        }
    }

    removeSnippet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const { id } = req.params
            const starredSnippets = await this.starredService.removeSnippet(userId, id)
            if (starredSnippets) {
                res.status(200).json(starredSnippets)
            } else {
                res.status(400).json({ message: "Cannot delete Snippet" })
            }
        } catch (error) {
            next(error)
        }
    }

    getSnippetById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { snippetId } = req.body
            const starredSnippets = await this.starredService.getSnippetById(snippetId)
            res.status(200).json(starredSnippets)
        } catch (error) {
            next(error)
        }
    }


}