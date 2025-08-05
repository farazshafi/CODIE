export interface IMailService {
    sendMail(to: string, otp: string): Promise<void>;
    sendResetLink(to: string, link: string): Promise<void>;
    sendJoinRequest(to: string, requesterEmail: string, projectName: string): Promise<void>;
    sendInvitation(to: string, invitationFrom: string): Promise<void>;
    sendPlanExpiryNotification(to: string, expiryDate: string): Promise<void>;
    sendCommonEmail(to: string, subject: string, content: string): Promise<void>;
}