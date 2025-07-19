import { Model } from "mongoose";
import { ISubscription } from "../models/SubscriptionModel";
import { BaseRepository } from "./BaseRepository";
import { ISubscriptionRepository } from "./interface/ISubscriptionRepository";


export class SubscriptionRepository extends BaseRepository<ISubscription> implements ISubscriptionRepository {
    constructor(model: Model<ISubscription>) {
        super(model)
    }

    async findMany(filter: Record<string, unknown>, skip: number, limit: number): Promise<ISubscription[]> {
        return this.model
            .find(filter) 
            .skip(skip)
            .limit(limit)
        // .select('name')
    }

    async count(filter: Record<string, unknown>): Promise<number> {
        return this.model.countDocuments(filter)
    }

}