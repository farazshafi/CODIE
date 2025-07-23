import { Model } from "mongoose"
import { IOtp } from "../models/OtpModel"
import { BaseRepository } from "./BaseRepository"
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
        await this.model.deleteMany({ email })

        const newOtp = new this.model({ email, otpHash, expiresAt, verified });
        await newOtp.save();
    }

    async findValidOtp(email: string): Promise<IOtp> {
        return await this.model.findOne({
            email,
            verified: false,
        }).sort({ createdAt: -1 });
    }

    async markOtpAsVerified(email: string): Promise<void> {
        await this.model.updateOne({ email }, { $set: { verified: true } })
    }
}