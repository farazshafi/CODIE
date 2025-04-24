import mongoose, { Schema } from "mongoose";
import { model } from "mongoose";
import { IRequest } from "../types/requestType";


const requestSchema = new Schema<IRequest>({
    roomId: { type: String, required: true },
    reciverId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    status: { type: String, required: true, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

const RequestModel = model<IRequest>("Request", requestSchema);

export default RequestModel;