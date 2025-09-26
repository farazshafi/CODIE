import ResetLinkModel, { IResetLink } from '../models/ResetLinkModel';
import { ISubscription } from '../models/SubscriptionModel';
import { IUser } from '../models/UserModel';
import { IPaymentRepository } from '../repositories/interface/IPaymentRepository';
import { ISubscriptionRepository } from '../repositories/interface/ISubscriptionRepository';
import { IUserRepository } from '../repositories/interface/IUserRepository';
import { IUserSubscriptionRepository } from '../repositories/interface/IUserSubscriptionRepository';
import { HttpError } from '../utils/HttpError';
import { UserInput, GoogleAuthInput } from '../validation/userValidation';
import { IUserService } from './interface/IUserService';
import { ObjectId } from 'mongodb';

export class UserService implements IUserService {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        private readonly _subscriptionRepository: ISubscriptionRepository,
        private readonly _paymentRepository: IPaymentRepository

    ) { }

    async createUser(data: UserInput): Promise<IUser> {
        const existingUser = await this._userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new HttpError(409, "User already exists");
        }

        const user = await this._userRepository.create({
            ...data,
            password: data.password
        });

        const freeSubscription: ISubscription = await this._subscriptionRepository.findOne({ name: "Free" })

        await this._userSubscriptionRepository.createSubscriptionWhenUserRegister(user.id, freeSubscription._id as string)

        if (!freeSubscription) {
            throw new HttpError(404, "Free subscription not found")
        }
        return user
    }

    async findUserByEmail(email: string): Promise<IUser> {
        return this._userRepository.findByEmail(email);
    }

    async handleGoogleAuth(data: GoogleAuthInput): Promise<IUser> {
        let user = await this._userRepository.findByGoogleId(data.googleId);

        if (!user) {
            // Check if email exists but not with google auth
            user = await this._userRepository.findByEmail(data.email);
            if (user && !user.googleId) {
                throw new HttpError(409, "Email already registered with password");
            }

            user = await this._userRepository.create({
                name: data.name,
                email: data.email,
                googleId: data.googleId,
                avatarUrl: data.avatarUrl,
                isAdmin: data.isAdmin ?? false,
                isBlocked: data.isBlocked ?? false
            });
        }

        return user;
    }

    async savePasswordResetToken(email: string, hashedToken: string, expireDate: Date): Promise<IResetLink> {
        try {
            return await ResetLinkModel.create({
                email,
                tokenHash: hashedToken,
                expiresAt: expireDate
            });
        } catch (error) {
            console.log("Failed to save password reset token", error)
            throw new HttpError(500, "Failed to save password reset token")
        }
    }

    async findResetToken(tokenHash: string, email: string): Promise<IResetLink> {
        try {
            return await ResetLinkModel.findOne({ tokenHash, email });
        } catch (err) {
            console.log("Errro while getting token", err)
            throw new HttpError(404, "Reset Token Not Found")
        }
    }

    async updateUserPassword(email: string, password: string): Promise<void> {
        try {
            await this._userRepository.findByEmailAndUpdate(email, { password })
        } catch (error) {
            console.log("Error while updating password", error)
            throw new HttpError(500, "Error while updating Password!")
        }
    }

    async deleteResetToken(email: string): Promise<void> {
        await ResetLinkModel.deleteOne({ email })
    }

    async searchAllUsers(email: string, userId: string): Promise<IUser[]> {
        try {
            return await this._userRepository.find({ email: { "$regex": email, "$options": "i" }, isAdmin: false, _id: { "$ne": new ObjectId(userId) } });
        } catch (error) {
            console.log("Failed to get all users", error)
            throw new HttpError(500, "Filed to get all users")
        }
    }

    async findUsersWithPagination(filter: Record<string, unknown>, page: number, limit: number): Promise<IUser[]> {
        const skip = (page - 1) * limit;
        return this._userRepository.findMany(filter, skip, limit);
    }

    async countUsers(filter: Record<string, unknown>): Promise<number> {
        return this._userRepository.count(filter);
    }

    async findUserById(userId: string): Promise<IUser> {
        return await this._userRepository.findById(userId)
    }

    async blockUserById(userId: string): Promise<void> {
        await this._userRepository.findByIdAndUpdate(userId, { isBlocked: true })
    }

    async unblockUserById(userId: string): Promise<void> {
        await this._userRepository.findByIdAndUpdate(userId, { isBlocked: false })
    }

    async updateUser(userId: string, data: { name: string, portfolio: string, github: string, avatar: string }): Promise<IUser> {
        return await this._userRepository.findByIdAndUpdate(userId, {
            name: data.name,
            github: data.github,
            portfolio: data.portfolio,
            avatarUrl: data.avatar
        })
    }

    async getUserData(userId: string): Promise<IUser> {
        try {
            const userData = await this._userRepository.findById(userId)
            if (!userData) throw new HttpError(404, "User Not found")
            return userData
        } catch (error) {
            if (error instanceof error) {
                throw error
            }
            console.log(error)
            throw new HttpError(500, "server error while getting user data")
        }
    }

    async adminDashboardUserData(): Promise<{ title: string, value: string, icon: string, change: string, positive: boolean }> {
        try {
            const totalUsers = await this._userRepository.count({ isAdmin: false });

            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const usersThisMonth = await this._userRepository.count({
                isAdmin: false,
                createdAt: { $gte: startOfThisMonth }
            });

            const usersLastMonth = await this._userRepository.count({
                isAdmin: false,
                createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
            });

            let change = '0%';
            let positive = true;
            if (usersLastMonth > 0) {
                const percentChange = ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;
                change = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
                positive = percentChange >= 0;
            } else if (usersThisMonth > 0) {
                change = '+100%';
                positive = true;
            }

            const icon = 'Users';

            return {
                title: 'Total Users',
                value: totalUsers.toLocaleString(),
                icon,
                change,
                positive
            };
        } catch (error) {
            console.log(error);
            throw new HttpError(500, "Server error while getting dashboard user data");
        }
    }

    async getAdminGraphData(): Promise<{ month: string; revenue: number; users: number }[]> {
        const monthsBack = 6;
        const [userData, revenueData] = await Promise.all([
            this._userRepository.getMonthlyUsers(monthsBack),
            this._paymentRepository.getMonthlyRevenue(monthsBack)
        ]);

        const result: { month: string; revenue: number; users: number }[] = [];

        for (let i = monthsBack - 1; i >= 0; i--) {
            const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();

            const users = userData.find(u => u.month === monthName && u.year === year)?.users || 0;
            const revenue = revenueData.find(r => r.month === monthName && r.year === year)?.revenue || 0;

            result.push({ month: monthName, revenue, users });
        }

        return result;
    }


}