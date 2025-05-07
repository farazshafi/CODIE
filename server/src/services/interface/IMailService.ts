export interface IMailService {
    sendMail(to: string, otp: string): Promise<void>;
    sendResetLink(to: string, link: string): Promise<void>;
    sendJoinRequest( to: string, requesterEmail: string, projectName: string): Promise<void>;
}