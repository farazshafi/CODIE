import { ISubscription } from "../../models/subscriptionModel";
import { CreateSubscriptionInput, UpdateSubscriptionInput } from "../../validation/subscriptionValidation";


export interface ISubscriptionService {
    createSubscription(data: CreateSubscriptionInput): Promise<ISubscription>;
    deleteSubscription(id: string): Promise<void>;
    getAllSubscription(): Promise<ISubscription[]>;
    updateSubscription(id: string, data: UpdateSubscriptionInput): Promise<ISubscription>
}