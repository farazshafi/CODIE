import mongoose, { Document } from "mongoose";

interface OtpDocument extends Document {
    email: string;
    otpHash: string;
    expiresAt: Date;
    verified: boolean;
}

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true }, 
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 60 }
});


export default mongoose.model<OtpDocument>("Otp", otpSchema);
