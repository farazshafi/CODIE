import { ENV } from "../config/env";
import { transporter } from "../config/mailConfig";
import { HttpError } from "../utils/HttpError";

export class MailService {

    static async sendMail(to: string, otp: string) {
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
}