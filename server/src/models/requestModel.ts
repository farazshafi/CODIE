import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRequestBase {
  roomId: string;
  reciverId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
}

export interface IRequest extends IRequestBase, Document {}

const requestSchema: Schema = new Schema<IRequest>(
  {
    roomId: { type: String, required: true },
    reciverId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const RequestModel: Model<IRequest> = mongoose.model<IRequest>("Request", requestSchema);
export default RequestModel;
