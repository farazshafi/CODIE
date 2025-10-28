import { IResetLink } from "../../models/ResetLinkModel";
import { IUser } from "../../models/UserModel";
import { GoogleAuthInput, UserInput } from "../../validation/userValidation";


export interface IUserService {
    createUser(data: UserInput): Promise<IUser>;
    findUserByEmail(email: string): Promise<IUser>;
    handleGoogleAuth(data: GoogleAuthInput): Promise<IUser>;
    savePasswordResetToken(email: string, hashedToken: string, expireDate: Date): Promise<IResetLink>;
    findResetToken(tokenHash: string, email: string): Promise<IResetLink>;
    updateUserPassword(email: string, password: string): Promise<void>;
    deleteResetToken(email: string): Promise<void>;
    searchAllUsers(input: string, userId: string): Promise<IUser[]>;
    findUsersWithPagination(filter: Record<string, unknown>, page: number, limit: number): Promise<IUser[]>;
    countUsers(filter: Record<string, unknown>): Promise<number>;
    findUserById(userId: string): Promise<IUser>;
    blockUserById(userId: string): Promise<void>;
    unblockUserById(userId: string): Promise<void>;
    updateUser(userId: string, data: { name: string, portfolio: string, github: string, avatar: string }): Promise<IUser>;
    getUserData(userId: string): Promise<IUser>;
    adminDashboardUserData(): Promise<{ title: string, value: string, icon: string, change: string, positive: boolean }>;
    getAdminGraphData(): Promise<{ month: string; revenue: number; users: number }[]>;
    getContributorData(id: string): Promise<IUser>;
    updateProfileVisiblity(userId: string, status:boolean):Promise<void>;
    getUsersGraphByYear(year: number): Promise<{ month: string, users: number }[]>;
}