import { Model } from "mongoose"
import otpModel, { IOtp } from "../models/otpModel"
import { BaseRepository } from "./baseRepository"
import { IOtpRepository } from "./interface/IOtpRepository"

export class OtpRepository extends BaseRepository<IOtp> implements IOtpRepository {

    constructor(model: Model<IOtp>) {
        super(model)
    }

    async saveOtp({ email, otpHash, expiresAt, verified }: {
        email: string
        otpHash: string
        expiresAt: Date
        verified: boolean
    }): Promise<void> {
        await otpModel.deleteMany({ email })

        const newOtp = new otpModel({ email, otpHash, expiresAt, verified });
        await newOtp.save();
    }

    async findValidOtp(email: string): Promise<IOtp> {
        return await otpModel.findOne({
            email,
            verified: false,
        }).sort({ createdAt: -1 });
    }

    async markOtpAsVerified(email: string): Promise<void> {
        await otpModel.updateOne({ email }, { $set: { verified: true } })
    }
}