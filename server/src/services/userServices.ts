import mongoose from 'mongoose';
import ResetLinkModel, { IResetLink } from '../models/ResetLinkModel';
import { ISubscription } from '../models/SubscriptionModel';
import { IUser } from '../models/UserModel';
import { ISubscriptionRepository } from '../repositories/interface/ISubscriptionRepository';
import { IUserRepository } from '../repositories/interface/IUserRepository';
import { IUserSubscriptionRepository } from '../repositories/interface/IUserSubscriptionRepository';
import { HttpError } from '../utils/HttpError';
import { UserInput, GoogleAuthInput } from '../validation/userValidation';
import { IUserService } from './interface/IUserService';
import { ObjectId } from 'mongodb';

export class UserService implements IUserService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly userSubscriptionRepository: IUserSubscriptionRepository,
        private readonly subscriptionRepository: ISubscriptionRepository,
    ) { }

    async createUser(data: UserInput): Promise<IUser> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new HttpError(409, "User already exists");
        }

        const user = await this.userRepository.create({
            ...data,
            password: data.password
        });

        const freeSubscription: ISubscription = await this.subscriptionRepository.findOne({ name: "Free" })
        console.log(freeSubscription)
        if (!freeSubscription) {
            throw new HttpError(404, "Free subscription not found")
        }

        await this.userSubscriptionRepository.createSubscriptionWhenUserRegister(user.id, freeSubscription._id as string)

        return user
    }

    async findUserByEmail(email: string): Promise<IUser> {
        return this.userRepository.findByEmail(email);
    }

    async handleGoogleAuth(data: GoogleAuthInput): Promise<IUser> {
        let user = await this.userRepository.findByGoogleId(data.googleId);

        if (!user) {
            // Check if email exists but not with google auth
            user = await this.userRepository.findByEmail(data.email);
            if (user && !user.googleId) {
                throw new HttpError(409, "Email already registered with password");
            }

            user = await this.userRepository.create({
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
            await this.userRepository.findByEmailAndUpdate(email, { password })
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
            return await this.userRepository.find({ email: { "$regex": email, "$options": "i" }, isAdmin: false, _id: { "$ne": new ObjectId(userId) } });
        } catch (error) {
            console.log("Failed to get all users", error)
            throw new HttpError(500, "Filed to get all users")
        }
    }

    async findUsersWithPagination(filter: Record<string, unknown>, page: number, limit: number): Promise<IUser[]> {
        const skip = (page - 1) * limit;
        return this.userRepository.findMany(filter, skip, limit);
    }

    async countUsers(filter: Record<string, unknown>): Promise<number> {
        return this.userRepository.count(filter);
    }

    async findUserById(userId: string): Promise<IUser> {
        return await this.userRepository.findById(userId)
    }

    async blockUserById(userId: string): Promise<void> {
        await this.userRepository.findByIdAndUpdate(userId, { isBlocked: true })
    }

    async unblockUserById(userId: string): Promise<void> {
        await this.userRepository.findByIdAndUpdate(userId, { isBlocked: false })
    }

}