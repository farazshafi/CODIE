import { IResetLink } from "../../models/resetLinkModel";
import { IUser } from "../../models/userModel";
import { GoogleAuthInput, UserInput } from "../../validation/userValidation";


export interface IUserService {
    createUser(data: UserInput): Promise<IUser>;
    findUserByEmail(email: string): Promise<IUser>;
    handleGoogleAuth(data: GoogleAuthInput): Promise<IUser>;
    savePasswordResetToken(email: string, hashedToken: string, expireDate: Date): Promise<IResetLink>;
    findResetToken(tokenHash: string, email: string): Promise<IResetLink>;
    updateUserPassword(email: string, password: string): Promise<void>;
    deleteResetToken(email: string): Promise<void>
}