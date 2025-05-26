import { Model } from "mongoose";
import { ISubscription } from "../models/subscriptionModel";
import { BaseRepository } from "./baseRepository";
import { ISubscriptionRepository } from "./interface/ISubscriptionRepository";


export class SubscriptionRepository extends BaseRepository<ISubscription> implements ISubscriptionRepository {
    constructor(model: Model<ISubscription>) {
        super(model)
    }

    async findMany(filter: any, skip: number, limit: number): Promise<ISubscription[]> {
        return this.model
            .find(filter)
            .skip(skip)
            .limit(limit)
        // .select('name')
    }

    async count(filter: any): Promise<number> {
        return this.model.countDocuments(filter)
    }

}