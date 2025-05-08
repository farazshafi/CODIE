import mongoose, { Document, Model, Schema } from "mongoose";


export interface IInvitationBase {
    roomId: string;
    reciverId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
}

export interface IInvitation extends IInvitationBase, Document { }

const invitationSchema: Schema = new mongoose.Schema({
    roomId: { type: String, required: true },
    reciverId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    status: {
        type: String,
        required: true,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
}, { timestamps: true })

export const InvitationModel: Model<IInvitation> = mongoose.model<IInvitation>("Invitation", invitationSchema)
export default InvitationModel