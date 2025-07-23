import { ISubscription } from "../../models/SubscriptionModel";


export interface IUserSubscriptionService {
    findUserSubscription(userId:string): Promise<ISubscription>
}