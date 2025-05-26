import { Model } from "mongoose";
import { ISubscription } from "../models/subscriptionModel";
import { BaseRepository } from "./baseRepository";
import { ISubscriptionRepository } from "./interface/ISubscriptionRepository";


export class SubscriptionRepository extends BaseRepository<ISubscription> implements ISubscriptionRepository {
    constructor(model: Model<ISubscription>) {
        super(model)
    }
}