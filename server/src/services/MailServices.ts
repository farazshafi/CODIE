import { ENV } from "../config/env";
import { transporter } from "../config/mailConfig";
import { HttpError } from "../utils/HttpError";
import { IMailService } from "./interface/IMailService";

export class MailService implements IMailService {


    async sendMail(to: string, otp: string): Promise<void> {
        try {
            await transporter.sendMail({
                from: `Codie Online Collabrative Editor <${ENV.EMAIL_USER}>`,
                to: to,
                subject: "Your OTP for Codie Online Collabrative Editor",
                html: `<p>Your OTP is: <b>${otp}</b></p>`,
            });

        } catch (error) {
            console.error("Error sending email: ", error);
            throw new HttpError(401, "Failed to send email");
        }
    }

    async sendResetLink(to: string, link: string): Promise<void> {
        try {
            await transporter.sendMail({
                from: `Codie Online Collabrative Editor <${ENV.EMAIL_USER}>`,
                to: to,
                subject: "Password Reset Link for Codie Online Collaborative Editor",
                html: `<p>Click the following link to reset your password: <a href="${link}">${link}</a></p>
                       <p>If this was not you, please ignore this email.</p>`,
            });

        } catch (error) {
            console.error("Error sending email: ", error);
            throw new HttpError(401, "Failed to send reset link");
        }
    }

    async sendJoinRequest(to: string, requesterEmail: string, projectName: string): Promise<void> {
        try {
            await transporter.sendMail({
                from: `Codie Online Collabrative Editor <${ENV.EMAIL_USER}>`,
                to: to,
                subject: "New Collaboration Request on Codie Online Collaborative Editor",
                html: `<h1>Collaboration Request</h1>
                       <p>A ${requesterEmail} has requested to collaborate on the project: <b>${projectName}</b>.</p>
                       <p>Requester Email: <b>${requesterEmail}</b></p>
                       <p>Please review the request and take the necessary action.</p>
                    <p>For more details, visit: <a href="http://localhost:3000/dashboard">Check Notifications</a></p>,`
            });

        } catch (error) {
            console.error("Error sending notification email: ", error);
            throw new HttpError(401, "Failed to send collaboration request notification");
        }
    }

    async sendInvitation(to: string, invitationFrom: string): Promise<void> {
        try {
            await transporter.sendMail({
                from: `Codie Online Collabrative Editor <${ENV.EMAIL_USER}>`,
                to: to,
                subject: "Invitation to Contribute on Codie Online Collaborative Editor",
                html: `<h1>You're Invited!</h1>
                       <p>${invitationFrom} has invited you to contribute to their project on Codie Online Collaborative Editor.</p>
                       <p>To accept the invitation and start collaborating, please visit the following link:</p>
                       <p><a href="http://localhost:3000/dashboard">Accept Invitation</a></p>
                       <p>If you did not expect this invitation, you can safely ignore this email.</p>`
            });

        } catch (error) {
            console.error("Error sending notification email: ", error);
            throw new HttpError(401, "Failed to send collaboration request notification");
        }
    }

    async sendPlanExpiryNotification(to: string, expiryDate: string): Promise<void> {
        try {
            await transporter.sendMail({
                from: `Codie Online Collabrative Editor <${ENV.EMAIL_USER}>`,
                to: to,
                subject: "Your Plan Expiry Notice - Codie Online Collaborative Editor",
                html: `<h1>Plan Expiry Reminder</h1>
                       <p>Your current plan is set to expire on <b>${expiryDate}</b>.</p>
                       <p>Please renew your subscription to continue enjoying uninterrupted service.</p>
                       <p>If you have already renewed, please ignore this message.</p>`
            });
        } catch (error) {
            console.error("Error sending plan expiry notification email: ", error);
            throw new HttpError(401, "Failed to send plan expiry notification");
        }
    }

    async sendCommonEmail(to: string, subject: string, content: string): Promise<void> {
        try {
            await transporter.sendMail({
                from: `Codie Online Collabrative Editor <${ENV.EMAIL_USER}>`,
                to: to,
                subject: subject || "New Notification from Codie",
                html: content
            });
        } catch (error) {
            console.error("Error sending common email: ", error);
            throw new HttpError(401, "Failed to send email");
        }
    }

}