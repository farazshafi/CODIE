import { NextFunction, Request, Response } from "express";
import { ICommentService } from "../services/interface/ICommentService";
import { ApiResponse } from "../utils/ApiResponse";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export class CommentController {
    constructor(
        private readonly _commentService: ICommentService
    ) { }

    createComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const { comment, projectId } = req.body
            if (!comment || !projectId || comment.length < 1) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "Please provide comment")
                res.status(response.statusCode).json(response)
            }

            const newComment = await this._commentService.createComment(userId, comment, projectId)
            const response = new ApiResponse(HttpStatusCode.OK, newComment, "succesfully Created Comment")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    getAllComments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { projectId } = req.params
            if (!projectId) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "Please provide Project id")
                res.status(response.statusCode).json(response)
            }

            const comments = await this._commentService.getComments(projectId)
            const response = new ApiResponse(HttpStatusCode.OK, comments, "succesfully Found Comments")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    toggleLike = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;

            const updatedComment = await this._commentService.toggleLikeComment(commentId, userId);

            const response = new ApiResponse(HttpStatusCode.OK, updatedComment, "succesfully updated like for a  Comment")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error);
        }
    }
}