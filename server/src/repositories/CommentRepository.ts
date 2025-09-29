import mongoose, { Model } from "mongoose";
import { IComment } from "../models/CommentModel";
import { BaseRepository } from "./BaseRepository";
import { ICommentRepository } from "./interface/ICommentRepository";

export class CommentRepository extends BaseRepository<IComment> implements ICommentRepository {
    constructor(model: Model<IComment>) {
        super(model)
    }

    getModel(): Model<IComment> {
        return this.model
    }

    async findByProjectIdAndPopulate(projectId: string): Promise<IComment[]> {
        return this.model.find({ projectId }).populate('userId', 'name avatarUrl').select("comment userId likes projectId createdAt")
    }

    async toggleLike(commentId: string, userId: string): Promise<IComment | null> {
        const comment = await this.model.findById(commentId);
        if (!comment) return null;

        const userObjectId = new mongoose.Types.ObjectId(userId);

        console.log("comments ", comment)

        if (comment.likes.includes(userObjectId)) {
            await this.model.findByIdAndUpdate(
                commentId,
                { $pull: { likes: userObjectId } },
                { new: true }
            );
        } else {
            await this.model.findByIdAndUpdate(
                commentId,
                { $addToSet: { likes: userObjectId } },
                { new: true }
            );
        }

        return this.model.findById(commentId)
            .populate("userId", "name avatarUrl")
            .select("comment userId likes projectId createdAt updatedAt");

    }

}