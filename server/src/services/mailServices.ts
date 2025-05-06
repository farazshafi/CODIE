import { ENV } from "../config/env";
import { transporter } from "../config/mailConfig";
import { HttpError } from "../utils/HttpError";
import { IMailService } from "./interface/IMailService";

export class MailService implements IMailService {


    async sendMail(to: string, otp: string): Promise<void> {
        try {
            const info = await transporter.sendMail({
                from: `Codie Online Collabrative Editor <${ENV.EMAIL_USER}>`,
                to: to,
                subject: "Your OTP for Codie Online Collabrative Editor",
                html: `<p>Your OTP is: <b>${otp}</b></p>`,
            });

            console.log("Message sent: %s", info.messageId);
        } catch (error) {
            console.error("Error sending email: ", error);
            throw new HttpError(401, "Failed to send email");
        }
    }

    async sendResetLink(to: string, link: string): Promise<void> {
        try {
            const info = await transporter.sendMail({
                from: `Codie Online Collabrative Editor <${ENV.EMAIL_USER}>`,
                to: to,
                subject: "Password Reset Link for Codie Online Collaborative Editor",
                html: `<p>Click the following link to reset your password: <a href="${link}">${link}</a></p>
                       <p>If this was not you, please ignore this email.</p>`,
            });

            console.log("Message sent: %s", info.messageId);
        } catch (error) {
            console.error("Error sending email: ", error);
            throw new HttpError(401, "Failed to send reset link");
        }
    }


}