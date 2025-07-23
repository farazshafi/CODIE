import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResetLinkBase {
    email: string;
    tokenHash: string;
    expireAt: Date;
}

export interface IResetLink extends IResetLinkBase, Document { }

const resetLinkSchema: Schema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

resetLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export const ResetLinkModel: Model<IResetLink> = mongoose.models.ResetLink || mongoose.model<IResetLink>("ResetLink", resetLinkSchema)
export default ResetLinkModel

