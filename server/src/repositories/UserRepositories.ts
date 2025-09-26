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

    async getMonthlyUsers(monthsBack: number = 6): Promise<{ month: string; year: number; users: number }[]> {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);

        const data = await this.model.aggregate([
            {
                $match: {
                    isAdmin: false,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    users: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return data.map(d => {
            const monthName = new Date(d._id.year, d._id.month - 1, 1).toLocaleString('default', { month: 'short' });
            return {
                month: monthName, 
                year: d._id.year,
                users: d.users
            };
        });
    }


}