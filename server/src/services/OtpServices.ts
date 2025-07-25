import { generateOtp } from "../utils/generateOtp"
import bcrypt from "bcryptjs"
import { HttpError } from "../utils/HttpError"
import { IOtpRepository } from "../repositories/interface/IOtpRepository"
import { IMailService } from "./interface/IMailService"

export class OtpService {

    constructor(
        private readonly otpRepository: IOtpRepository,
        private readonly mailService: IMailService
    ) { }

    async generateAndSendOtp(email: string): Promise<void> {
        const otp = generateOtp()
        const otpHash = await bcrypt.hash(otp, 10)
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minute 
        await this.otpRepository.saveOtp({ email, otpHash, expiresAt, verified: false })
        await this.mailService.sendMail(email, otp)

        console.log("otp: ", otp)
    }

    async verifyOtp(email: string, otp: string): Promise<void> {
        const record = await this.otpRepository.findValidOtp(email)
        if (!record || new Date() > record.expiresAt) throw new HttpError(401, "OTP expired, please request a new one")

        const isMatch = await bcrypt.compare(otp, record.otpHash)

        if (!isMatch) throw new HttpError(401, "Invalid OTP")

        await this.otpRepository.markOtpAsVerified(email)
    }
}