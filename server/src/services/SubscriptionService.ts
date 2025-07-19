import { ISubscription, ISubscriptionBase } from "../models/SubscriptionModel";
import { ISubscriptionRepository } from "../repositories/interface/ISubscriptionRepository";
import { HttpError } from "../utils/HttpError";
import { CreateSubscriptionInput, UpdateSubscriptionInput } from "../validation/subscriptionValidation";
import { ISubscriptionService } from "./interface/ISubscriptionService";


export class SubscriptionService implements ISubscriptionService {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
    ) { }

    async createSubscription(data: CreateSubscriptionInput): Promise<ISubscription> {
        try {
            const subscriptionExists = await this.subscriptionRepository.findOne({ name: data.name });
            if (subscriptionExists) {
                throw new HttpError(409, "Subscription name already exists");
            }

            const subscription = await this.subscriptionRepository.create(data as ISubscriptionBase);
            return subscription;

        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            console.log(error);
            throw new HttpError(500, "Error While Creating Subscription");
        }
    }

    async deleteSubscription(id: string): Promise<void> {
        try {
            await this.subscriptionRepository.delete(id)
        } catch (error) {
            console.log(error)
            throw new HttpError(500, "Error while deleting subscription")
        }
    }

    async getAllSubscription(): Promise<ISubscription[]> {
        try {
            return this.subscriptionRepository.find({})
        } catch (error) {
            console.log(error)
            throw new HttpError(500, "Error while getting all Subscription")
        }
    }


    async updateSubscription(id: string, data: UpdateSubscriptionInput): Promise<ISubscription> {
        try {
            const existing = await this.subscriptionRepository.findById(id);
            if (!existing) {
                throw new HttpError(404, "Subscription not found");
            }

            if (data.name && data.name !== existing.name) {
                const nameExists = await this.subscriptionRepository.findOne({ name: data.name });
                if (nameExists) {
                    throw new HttpError(409, "Subscription name already in use");
                }
            }

            const updated = await this.subscriptionRepository.update(id, data);
            return updated;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error);
            throw new HttpError(500, "Error while updating subscription");
        }
    }

    async findById(id: string): Promise<ISubscription | null> {
        return this.subscriptionRepository.findById(id);
    }

    async blockSubscription(id: string): Promise<void> {
        await this.subscriptionRepository.findByIdAndUpdate(id, { isVisible: false })
    }

    async unblockSubscription(id: string): Promise<void> {
        await this.subscriptionRepository.findByIdAndUpdate(id, { isVisible: true })
    }

    async findSubscriptionsWithPagination(filter: any, page: number, limit: number): Promise<ISubscription[]> {
        const skip = (page - 1) * limit;
        return this.subscriptionRepository.findMany(filter, skip, limit);
    }

    async countSubscription(filter: any): Promise<number> {
        try {
            return this.subscriptionRepository.count(filter);
        } catch (error) {
            console.log(error);
            throw new HttpError(500, "Error while counting subscriptions");
        }
    }

    async getSubscription(): Promise<ISubscription[]> {
        return await this.subscriptionRepository.find({ isVisible: true })
    }

}