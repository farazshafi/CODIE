import mongoose, { Schema, Document } from "mongoose";

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

export const ResetLinkModel = mongoose.model<IResetLink>("ResetLink", resetLinkSchema)
export default ResetLinkModel

