import { NextFunction, Request, Response } from "express";
import { IStarredService } from "../services/interface/IStarredService";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";

export class StarredController {
    constructor(
        private readonly _starredService: IStarredService,
    ) { }

    getStarredSnippets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const starredSnippets = await this._starredService.getUserStarredSnippets(userId);

            const response = new ApiResponse(HttpStatusCode.OK, starredSnippets, "Fetched starred snippets");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    starASnippet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { projectId } = req.body;
            const starredSnippet = await this._starredService.starASnippet(userId, projectId);

            const response = new ApiResponse(HttpStatusCode.OK, starredSnippet, "Snippet starred successfully");
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error);
        }
    }

    removeSnippet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const removed = await this._starredService.removeSnippet(userId, id);

            if (removed) {
                const response = new ApiResponse(HttpStatusCode.OK, removed, "Snippet removed successfully");
                res.status(response.statusCode).json(response);
            } else {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "Cannot delete snippet");
                res.status(response.statusCode).json(response);
            }
        } catch (error) {
            next(error);
        }
    }

    getSnippetById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { snippetId } = req.body;
            const snippet = await this._starredService.getSnippetById(snippetId);

            if (snippet) {
                const response = new ApiResponse(HttpStatusCode.OK, snippet, "Snippet fetched successfully");
                res.status(response.statusCode).json(response);
            } else {
                const response = new ApiResponse(HttpStatusCode.NOT_FOUND, null, "Snippet not found");
                res.status(response.statusCode).json(response);
            }
        } catch (error) {
            next(error);
        }
    }
}
