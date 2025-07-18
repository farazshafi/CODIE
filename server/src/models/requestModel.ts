import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRequestBase {
  roomId: string;
  reciverId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  statusChangedAt?: Date | null;
}

export interface IRequest extends IRequestBase, Document { }

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
    },
    statusChangedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

requestSchema.index(
  { statusChangedAt: 1 },
  {
    expireAfterSeconds: 10 * 24 * 60 * 60, // 10 days
    partialFilterExpression: { status: { $in: ["accepted", "rejected"] } }
  }
);


export const RequestModel: Model<IRequest> = mongoose.model<IRequest>("Request", requestSchema);
export default RequestModel;
