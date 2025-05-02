export interface IMailService {
    sendMail(to: string, otp: string): Promise<void>;
}