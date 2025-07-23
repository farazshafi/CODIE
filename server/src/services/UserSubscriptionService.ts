import { ISubscription } from "../models/SubscriptionModel";
import { ISubscriptionRepository } from "../repositories/interface/ISubscriptionRepository";
import { IUserSubscriptionRepository } from "../repositories/interface/IUserSubscriptionRepository";
import { HttpError } from "../utils/HttpError";
import { IUserSubscriptionService } from "./interface/IUserSubscriptionService";


export class UserSubscriptionService implements IUserSubscriptionService {
    constructor(
        private readonly userSubscriptionRepo: IUserSubscriptionRepository,
        private readonly subscriptionRepo: ISubscriptionRepository,
    ) { }

    async findUserSubscription(userId: string): Promise<ISubscription> {
        try {
            const userPlanId = (await this.userSubscriptionRepo.findOne({ userId })).planId.toString()
            if (!userPlanId) {
                throw new HttpError(404, "User Plan not found!")
            }

            const subscription = await this.subscriptionRepo.findById(userPlanId)
            if (!subscription) {
                throw new HttpError(404, "Subscription Not found!")
            }
            return subscription
            
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Server error ,While Finding subscription")
        }

    }
}