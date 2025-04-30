import { Model } from 'mongoose';
import { IUser } from '../models/userModel';
import { BaseRepository } from './baseRepository';
import { IUserRepository } from './interface/IUserRepository';

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
}