import { ISubscription } from "../../models/SubscriptionModel";
import { IUserSubscription } from "../../models/UserSubscriptionModel";


export interface IUserSubscriptionService {
    findUserSubscription(userId: string): Promise<ISubscription>;
    verifyPaymentAndUpdateUserSubscription(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, userId: string, planId: string, amount: number): Promise<IUserSubscription>
    applyDowngrade(): Promise<void>;
    sendExpiryReminder(): Promise<void>;
    getUserSubscription(userId: string): Promise<IUserSubscription>;
    downgradeToFreePlan(userId: string): Promise<IUserSubscription>
}