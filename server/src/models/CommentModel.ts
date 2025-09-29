import mongoose, { Schema, Document } from "mongoose";

export interface ICommentBase {
    userId: mongoose.Types.ObjectId,
    projectId: mongoose.Types.ObjectId,
    likes: mongoose.Types.ObjectId[];
    comment: string;
}

export interface IComment extends ICommentBase, Document { }

const commentSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    projectId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Project"
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const CommentModel = mongoose.model<IComment>("Comment", commentSchema)
export default CommentModel