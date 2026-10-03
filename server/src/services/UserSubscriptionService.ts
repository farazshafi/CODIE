import mongoose from "mongoose";
import { ISubscription } from "../models/SubscriptionModel";
import { ISubscriptionRepository } from "../repositories/interface/ISubscriptionRepository";
import { IUserSubscriptionRepository } from "../repositories/interface/IUserSubscriptionRepository";
import { HttpError } from "../utils/HttpError";
import { IUserSubscriptionService } from "./interface/IUserSubscriptionService";
import { ENV } from "../config/env";
import * as crypto from "crypto";
import { IUserSubscription } from "../models/UserSubscriptionModel";
import { IMailService } from "./interface/IMailService";
import { IUserRepository } from "../repositories/interface/IUserRepository";
import { IPaymentService } from "./interface/IPaymentService";
import { GetSubscriptionHistoryResult } from "../repositories/UserSubscriptionRepository";


export class UserSubscriptionService implements IUserSubscriptionService {
    constructor(
        private readonly _userSubscriptionRepo: IUserSubscriptionRepository,
        private readonly _subscriptionRepo: ISubscriptionRepository,
        private readonly _mailService: IMailService,
        private readonly _userRepository: IUserRepository,
        private readonly _paymentService: IPaymentService,
    ) { }

    async findUserSubscription(userId: string): Promise<ISubscription> {
        try {
            const userPlanId = (await this._userSubscriptionRepo.findOne({ userId })).planId.toString()
            if (!userPlanId) {
                throw new HttpError(404, "User Plan not found!")
            }

            const subscription = await this._subscriptionRepo.findById(userPlanId)
            if (!subscription) {
                throw new HttpError(404, "Subscription Not found!")
            }
            return subscription

        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Server error ,While Finding subscription")
        }

    }

    async getUserSubscription(userId: string): Promise<IUserSubscription> {
        try {
            const userPlan = await this._userSubscriptionRepo.findOne({ userId })
            if (!userPlan) {
                throw new HttpError(404, "User Plan not found!")
            }

            return userPlan

        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError(500, "Server error ,While Finding subscription")
        }

    }

    async verifyPaymentAndUpdateUserSubscription(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string,
        userId: string, planId: string, amount: number): Promise<IUserSubscription> {
        try {
            const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSign = crypto
                .createHmac("sha256", ENV.RAZORPAY_SECRET_ID!)
                .update(sign, "utf-8")
                .digest("hex");

            if (razorpay_signature !== expectedSign) {
                await this._paymentService.createPayment({
                    userId: new mongoose.Types.ObjectId(userId),
                    subscriptionId: new mongoose.Types.ObjectId(planId),
                    amount,
                    currency: "INR",
                    paymentStatus: "failed",
                    transactionId: razorpay_payment_id,
                });
                throw new HttpError(400, "Invalid payment signature");
            }

            await this._paymentService.createPayment({
                userId: new mongoose.Types.ObjectId(userId),
                subscriptionId: new mongoose.Types.ObjectId(planId),
                amount,
                currency: "INR",
                paymentStatus: "completed",
                transactionId: razorpay_payment_id,
            });

            const currUserSub = await this._userSubscriptionRepo.findOne({ userId });
            const user = await this._userRepository.findById(userId);
            const newPlan = await this._subscriptionRepo.findById(planId);
            if (!newPlan) throw new HttpError(404, "Plan is not found!");

            const now = new Date();
            let startDate = now;
            let endDate = new Date(now);

            let updatedPlanId = new mongoose.Types.ObjectId(planId);
            let updatedNextPlan: mongoose.Types.ObjectId | null = null;

            let subject = '';
            let message = '';

            const currentPlan = (currUserSub && currUserSub.planId)
                ? await this._subscriptionRepo.findById(String(currUserSub.planId))
                : null;

            if (!currUserSub || !currUserSub.planId || !currentPlan) {
                // Initial subscription or missing existing plan
                endDate.setMonth(endDate.getMonth() + 1);
                updatedPlanId = new mongoose.Types.ObjectId(planId);
                subject = `Welcome to ${newPlan.name} Plan!`;
                message = `Congratulations! You have successfully subscribed to the ${newPlan.name} plan.`;
            } else {
                if (newPlan.pricePerMonth > currentPlan.pricePerMonth) {
                    // Immediate Upgrade
                    startDate = now;
                    endDate.setMonth(now.getMonth() + 1);
                    updatedPlanId = new mongoose.Types.ObjectId(planId);
                    updatedNextPlan = null;
                    subject = `You've Upgraded to ${newPlan.name}!`;
                    message = `Congratulations! You have successfully upgraded to the ${newPlan.name} plan.`;
                } else if (String(newPlan._id) === String(currentPlan._id) || newPlan.pricePerMonth === currentPlan.pricePerMonth) {
                    // Renewal / Same tier
                    if (currUserSub.endDate && currUserSub.endDate > now) {
                        startDate = currUserSub.startDate;
                        endDate = new Date(currUserSub.endDate);
                        endDate.setMonth(endDate.getMonth() + 1);
                    } else {
                        endDate.setMonth(endDate.getMonth() + 1);
                    }
                    updatedPlanId = new mongoose.Types.ObjectId(planId);
                    updatedNextPlan = null;
                    subject = `Your Plan Has Been Renewed`;
                    message = `Your ${newPlan.name} subscription has been successfully renewed.`;
                } else {
                    // Scheduled Downgrade
                    updatedPlanId = currUserSub.planId;
                    updatedNextPlan = new mongoose.Types.ObjectId(planId);
                    startDate = currUserSub.startDate;
                    endDate = currUserSub.endDate;
                    subject = `You've Downgraded to ${newPlan.name}`;
                    message = `Your subscription will change to the ${newPlan.name} plan after your current billing cycle ends.`;
                }
            }

            // Send confirmation email asynchronously (fire-and-forget) so SMTP network latency or timeouts NEVER block payment response or return 502
            if (user && user.email) {
                this._mailService.sendCommonEmail(user.email, subject, message).catch((err) => {
                    console.error("Failed to send subscription confirmation email:", err);
                });
            }

            const userSubscription = await this._userSubscriptionRepo.findOneAndUpdate(
                { userId },
                {
                    planId: updatedPlanId,
                    nextPlan: updatedNextPlan,
                    startDate,
                    endDate,
                    isActive: true,
                    paymentOptions: {
                        paymentTime: new Date(),
                        paymentMethod: "Razorpay"
                    }
                },
                { new: true, upsert: true }
            );

            return userSubscription;
        } catch (error) {
            console.error("Error in verifyPaymentAndUpdateUserSubscription:", error);
            if (error instanceof HttpError) {
                throw error;
            }

            throw new HttpError(500, "Error while Verifing user subscription");
        }
    }

    async applyDowngrade(): Promise<void> {
        try {
            const now = new Date()
            const freeId = (await this._subscriptionRepo.findOne({ name: "Free" })).id
            const expiredSubscriptions = await this._userSubscriptionRepo.find({ endDate: { $lt: now }, isActive: true })
            for (const sub of expiredSubscriptions) {

                sub.isActive = false
                await this._userSubscriptionRepo.save(sub)

                let newPlanId: mongoose.Types.ObjectId;
                if (!sub.nextPlan) {
                    newPlanId = freeId
                } else {
                    const newPlan = await this._subscriptionRepo.findById(String(sub.nextPlan))
                    if (!newPlan) throw new HttpError(404, "New plan is not found!")
                    newPlanId = new mongoose.Types.ObjectId(newPlan._id as string)
                }

                const newSub = {
                    userId: sub.userId,
                    planId: newPlanId,
                    startDate: now,
                    endDate: new Date(now.setMonth(now.getMonth() + 1)),
                    isActive: true,
                    paymentOptions: {
                        paymentTime: new Date(),
                        paymentMethod: "Automatic"
                    },
                    cancelledDate: null,
                    nextPlan: null,
                    aiUsage: 0
                }

                await this._userSubscriptionRepo.create(newSub as IUserSubscription)

            }
        } catch (error) {
            console.log(error)
            throw new HttpError(500, "Server error, while applying downgrade")
        }
    }

    async downgradeToFreePlan(userId: string): Promise<IUserSubscription> {
        try {
            const userSubscription = await this._userSubscriptionRepo.findOne({ userId, isActive: true })
            if (!userSubscription) {
                throw new HttpError(404, "Active user subscription not found")
            }
            const freePlan = await this._subscriptionRepo.findOne({ name: "Free" })
            if (!freePlan) {
                throw new HttpError(404, "Free plan not found")
            }
            userSubscription.nextPlan = freePlan.id
            userSubscription.cancelledDate = new Date()

            await userSubscription.save()

            return userSubscription
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error)
            throw new HttpError(500, "Error while downgrading to Free plan")
        }
    }

    async sendExpiryReminder(): Promise<void> {
        const now = new Date()
        const threeDaysFromNow = new Date()

        threeDaysFromNow.setDate(now.getDate() + 3)

        const expireSoon = await this._userSubscriptionRepo.find({
            endDate: { $gt: now, $lt: threeDaysFromNow },
            isActive: true
        })

        for (const sub of expireSoon) {
            const user = await this._userRepository.findById(String(sub.userId))
            await this._mailService.sendPlanExpiryNotification(user.email, String(sub.endDate))
        }
    }

    async getAiUsage(userId: string): Promise<number> {
        try {
            const userSubscription = (await this._userSubscriptionRepo.findOne({ userId }))
            if (!userSubscription) {
                throw new HttpError(4.04, "User subscription not found!")
            }
            return userSubscription.aiUsage
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }
            console.log(error)
            throw new HttpError(500, "Error Occured While getting Ai usage")
        }
    }

    async getSubscriptionHistory(year?: number, month?: number, sort?: string, currentPage?: number, limit?: number, search?: string): Promise<GetSubscriptionHistoryResult> {
        try {
            return await this._userSubscriptionRepo.getSubscriptionHistory({ year, month, sort, currentPage, limit, search });
        } catch (error) {
            console.log(error)
            throw new HttpError(500, "Error Occured While getting subscription history")
        }
    }
}