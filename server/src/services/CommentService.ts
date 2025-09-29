import mongoose from "mongoose";
import { IComment } from "../models/CommentModel";
import { ICommentRepository } from "../repositories/interface/ICommentRepository";
import { HttpError } from "../utils/HttpError";
import { logger } from "../utils/logger";
import { ICommentService } from "./interface/ICommentService";


export class CommentService implements ICommentService {
    constructor(
        private readonly _commentRepo: ICommentRepository
    ) { }

    async createComment(userId: string, comment: string, projectId: string): Promise<IComment> {
        try {
            const newComment = await this._commentRepo.create({ userId: new mongoose.Types.ObjectId(userId), comment, projectId: new mongoose.Types.ObjectId(projectId) } as IComment)
            return newComment
        } catch (error) {
            logger.error(error.message || "Error while Creating comment")
            throw new HttpError(500, "Error while Creating comment")
        }
    }

    async getComments(projectId: string): Promise<IComment[]> {
        try {
            const comments = await this._commentRepo.findByProjectIdAndPopulate(projectId)
            return comments
        } catch (error) {
            logger.error(error.message || "Error while Geting all comments")
            throw new HttpError(500, "Error while Geting all comments")
        }
    }

    async toggleLikeComment(commentId: string, userId: string): Promise<IComment> {
        try {
            const updatedComment = await this._commentRepo.toggleLike(commentId, userId);
            if (!updatedComment) {
                throw new HttpError(404, "Comment not found");
            }
            return updatedComment;
        } catch (error) {
            logger.error(error.message || "Error while toggling like");
            throw new HttpError(500, "Error while toggling like");
        }
    }

}