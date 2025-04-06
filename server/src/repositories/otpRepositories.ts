import otpModel from "../models/otpModel"

export class OtpRepository {
    static async saveOtp({ email, otpHash, expiresAt, verified }: {
        email: string
        otpHash: string
        expiresAt: Date
        verified: boolean
    }) {
        await otpModel.deleteMany({ email })

        const newOtp = new otpModel({ email, otpHash, expiresAt, verified });
        await newOtp.save();
    }

    static async findValidOtp(email: string) {
        return await otpModel.findOne({
            email,
            verified: false,
        }).sort({ createdAt: -1 });
    }

    static async markOtpAsVerified(email: string) {
        return await otpModel.updateOne({ email }, { $set: { verified: true } })
    }
}