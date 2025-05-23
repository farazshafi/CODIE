import { IUser } from "../../models/userModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
    findByGoogleId(googleId: string): Promise<IUser | null>;
    findByEmailAndUpdate(email: string, updateData: Partial<IUser>): Promise<IUser | null>;
    findMany(filter: any, skip: number, limit: number): Promise<IUser[]>;
    count(filter: any): Promise<number>;
}