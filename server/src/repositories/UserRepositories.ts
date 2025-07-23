import { Model } from 'mongoose';
import { IUser } from '../models/UserModel';
import { BaseRepository } from './BaseRepository';
import { IUserRepository } from './interface/IUserRepository';
import bcrypt from "bcryptjs"

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor(model: Model<IUser>) {
        super(model);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return this.model.findOne({ email });
    }

    async findByGoogleId(googleId: string): Promise<IUser | null> {
        return this.model.findOne({ googleId });
    }

    async findByEmailAndUpdate(email: string, updateData: Partial<IUser>): Promise<IUser | null> {
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        return this.model.findOneAndUpdate({ email }, updateData, { new: true });
    }

    async findMany(filter: Record<string, unknown>, skip: number, limit: number): Promise<IUser[]> {
        return this.model
            .find(filter)
            .skip(skip)
            .limit(limit)
            .select('name email isBlocked avatarUrl')
    }

    async count(filter: Record<string, unknown>): Promise<number> {
        return this.model.countDocuments(filter);
    }

}