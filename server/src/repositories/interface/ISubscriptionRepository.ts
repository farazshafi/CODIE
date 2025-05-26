import { ISubscription } from "../../models/subscriptionModel";
import { IBaseRepository } from "./IBaseRepository";


export interface ISubscriptionRepository extends IBaseRepository<ISubscription> {
    findMany(filter: any, skip: number, limit: number): Promise<ISubscription[]>;
    count(filter: any): Promise<number>;
}