import { IUserSubscription } from "../../models/userSubscriptionModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserSubscriptionRepository extends IBaseRepository<IUserSubscription> {
    createSubscriptionWhenUserRegister(userId: string, planId: string): Promise<IUserSubscription>
}