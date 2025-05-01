import { IUser } from "../../models/userModel";
import { GoogleAuthInput, UserInput } from "../../validation/userValidation";


export interface IUserService {
    createUser(data: UserInput): Promise<IUser>
    findUserByEmail(email: string): Promise<IUser>
    handleGoogleAuth(data: GoogleAuthInput) : Promise<IUser>
}