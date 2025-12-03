import { IUserSubscription } from "../../models/UserSubscriptionModel";
import { GetSubscriptionHistoryParams, GetSubscriptionHistoryResult } from "../UserSubscriptionRepository";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserSubscriptionRepository extends IBaseRepository<IUserSubscription> {
    createSubscriptionWhenUserRegister(userId: string, planId: string): Promise<IUserSubscription>
    getSubscriptionHistory(params: GetSubscriptionHistoryParams): Promise<GetSubscriptionHistoryResult>
}