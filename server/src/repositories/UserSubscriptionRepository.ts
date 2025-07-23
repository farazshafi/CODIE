import mongoose, { Model } from "mongoose";
import UserSubscriptionModel, { IUserSubscription } from "../models/UserSubscriptionModel";
import { BaseRepository } from "./BaseRepository";
import { IUserSubscriptionRepository } from "./interface/IUserSubscriptionRepository";


export class UserSubscriptionRepository extends BaseRepository<IUserSubscription> implements IUserSubscriptionRepository {
    constructor(model: Model<IUserSubscription>) {
        super(model)
    }

    async createSubscriptionWhenUserRegister(userId: string, planId: string): Promise<IUserSubscription> {
        const user = new mongoose.Types.ObjectId(userId)
        const plan = new mongoose.Types.ObjectId(planId)
        return await UserSubscriptionModel.create({ userId: user, planId: plan })
    }
}