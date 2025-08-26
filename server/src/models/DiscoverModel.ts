import mongoose, { Document, Schema } from "mongoose";

export interface IDiscoverBase {
    projectId: mongoose.Types.ObjectId
    like: number;
    views: number,
    starred: number,
}

export interface IDiscover extends IDiscoverBase, Document { }

const discoverSchema: Schema = new Schema({
    projectId: { type: mongoose.Types.ObjectId, ref: "Project", requied: true },
    like: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    stared: { type: Number, default: 0 }
}, { timestamps: true })

export const DiscoverModel = mongoose.models.Discover || mongoose.model<IDiscover>("Discover", discoverSchema)
export default DiscoverModel