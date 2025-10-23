import { IUserSubscription } from "../../models/UserSubscriptionModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserSubscriptionRepository extends IBaseRepository<IUserSubscription> {
    createSubscriptionWhenUserRegister(userId: string, planId: string): Promise<IUserSubscription>
    getSubscriptionHistory(params: { year?: number; month?: number; sort?: string, currentPage?: number, limit?: number, search?: string }): Promise<any>
}