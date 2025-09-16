import { NextFunction, Request, Response } from "express";
import { IStarredService } from "../services/interface/IStarredService";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export class StarredController {
    constructor(
        private readonly _starredService: IStarredService,
    ) { }

    getStarredSnippets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const starredSnippets = await this._starredService.getUserStarredSnippets(userId)

            res.status(HttpStatusCode.OK).json(starredSnippets)
        } catch (error) {
            next(error)
        }
    }

    starASnippet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const { projectId } = req.body
            const starredSnippets = await this._starredService.starASnippet(userId, projectId)

            res.status(HttpStatusCode.OK).json(starredSnippets)
        } catch (error) {
            next(error)
        }
    }

    removeSnippet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const { id } = req.params
            const starredSnippets = await this._starredService.removeSnippet(userId, id)
            if (starredSnippets) {
                res.status(HttpStatusCode.OK).json(starredSnippets)
            } else {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Cannot delete Snippet" })
            }
        } catch (error) {
            next(error)
        }
    }

    getSnippetById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { snippetId } = req.body
            const starredSnippets = await this._starredService.getSnippetById(snippetId)
            res.status(HttpStatusCode.OK).json(starredSnippets)
        } catch (error) {
            next(error)
        }
    }


}