export interface IMailService {
    sendMail(to: string, otp: string): Promise<void>;
    sendResetLink(to: string, link: string): Promise<void>;
}