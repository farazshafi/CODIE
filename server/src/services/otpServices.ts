import { OtpRepository } from "../repositories/otpRepositories"
import { generateOtp } from "../utils/generateOtp"
import bcrypt from "bcryptjs"
import { MailService } from "./mailServices"
import { HttpError } from "../utils/HttpError"

export class OtpService {
    static async generateAndSendOtp(email: string) {
        const otp = generateOtp()
        const otpHash = await bcrypt.hash(otp, 10)
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000) // 1 minute 
        await OtpRepository.saveOtp({ email, otpHash, expiresAt, verified: false })
        await MailService.sendMail(email, otp)

        console.log("otp: ", otp)
    }

    static async verifyOtp(email: string, otp: string) {
        const record = await OtpRepository.findValidOtp(email)
        if (!record || new Date() > record.expiresAt) throw new HttpError(401, "OTP expired, please request a new one")

        const isMatch = await bcrypt.compare(otp, record.otpHash)

        if (!isMatch) throw new HttpError(401, "Invalid OTP")

        await OtpRepository.markOtpAsVerified(email)
    }
}