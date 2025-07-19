import { ISubscription } from "../../models/SubscriptionModel";
import { IBaseRepository } from "./IBaseRepository";


export interface ISubscriptionRepository extends IBaseRepository<ISubscription> {
    findMany(filter: Record<string, unknown>, skip: number, limit: number): Promise<ISubscription[]>;
    count(filter: Record<string, unknown>): Promise<number>;
}