import mongoose, { Document, Schema } from "mongoose";


export interface IOtpBase {
    email: string;
    otpHash: string;
    expiresAt: Date;
    verified: boolean;
}
export interface IOtp extends IOtpBase, Document { }


const otpSchema: Schema = new mongoose.Schema({
    email: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 60 }
});


export const OtpModel = mongoose.models.Otp || mongoose.model<IOtp>("Otp", otpSchema);
export default OtpModel
