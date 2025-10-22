import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoomBase {
    roomId: string,
    projectId: mongoose.Types.ObjectId,
    owner: mongoose.Types.ObjectId,
    collaborators?: {
        user: mongoose.Types.ObjectId,
        role: "owner" | "editor" | "viewer",
        joinedAt?: Date
    }[]
}

export interface IRoom extends IRoomBase, Document { }

const roles = ["owner", "editor", "viewer"];

const roomSchema: Schema = new Schema({
    roomId: { type: String, required: true, unique: true },
    projectId: { type: mongoose.Types.ObjectId, ref: "Project", required: true },
    owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    collaborators: [{
        user: { type: mongoose.Types.ObjectId, ref: "User" },
        role: { type: String, enum: roles, default: "viewer" },
        joinedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export const RoomModel: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>("Room", roomSchema);
export default RoomModel;
