import { IUser } from "../../models/UserModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
    findByGoogleId(googleId: string): Promise<IUser | null>;
    findByEmailAndUpdate(email: string, updateData: Partial<IUser>): Promise<IUser | null>;
    findMany(filter: Record<string, unknown>, skip: number, limit: number): Promise<IUser[]>;
    count(filter: Record<string, unknown>): Promise<number>;
    getMonthlyUsers(monthsBack: number): Promise<{ month: string; year: number; users: number }[]>
}