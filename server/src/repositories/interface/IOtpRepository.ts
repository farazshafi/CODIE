import { IOtp } from "../../models/otpModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IOtpRepository extends IBaseRepository<IOtp> {
    saveOtp({ email, otpHash, expiresAt, verified }: {
        email: string
        otpHash: string
        expiresAt: Date
        verified: boolean
    }): Promise<void>;
    findValidOtp(email: string): Promise<IOtp>;
    markOtpAsVerified(email: string): Promise<void>
}