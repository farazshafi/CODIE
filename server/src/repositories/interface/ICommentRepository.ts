import { Model } from "mongoose";
import { IComment } from "../../models/CommentModel";
import { IBaseRepository } from "./IBaseRepository";

export interface ICommentRepository extends IBaseRepository<IComment> {
    getModel(): Model<IComment>
    findByProjectIdAndPopulate(projectId: string): Promise<IComment[]>
    toggleLike(commentId: string, userId: string): Promise<IComment | null>
}