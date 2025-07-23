import { ISubscription } from "../../models/SubscriptionModel";
import { CreateSubscriptionInput, UpdateSubscriptionInput } from "../../validation/subscriptionValidation";


export interface ISubscriptionService {
    createSubscription(data: CreateSubscriptionInput): Promise<ISubscription>;
    deleteSubscription(id: string): Promise<void>;
    getAllSubscription(): Promise<ISubscription[]>;
    updateSubscription(id: string, data: UpdateSubscriptionInput): Promise<ISubscription>;
    findById(id: string): Promise<ISubscription | null>;
    blockSubscription(id: string): Promise<void>;
    unblockSubscription(id: string): Promise<void>;
    findSubscriptionsWithPagination(filter: Record<string, unknown>, page: number, limit: number): Promise<ISubscription[]>;
    countSubscription(filter: Record<string, unknown>): Promise<number>;
    getSubscription(): Promise<ISubscription[]>
}