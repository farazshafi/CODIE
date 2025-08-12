import mongoose, { Document, Schema } from "mongoose";


interface IStarredModelBase {
    projectId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId
}

export interface IStarred extends IStarredModelBase, Document { }

const starredSchema: Schema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true })


export const StarredModel = mongoose.models.Starred || mongoose.model<IStarred>("Starred", starredSchema)
export default StarredModel