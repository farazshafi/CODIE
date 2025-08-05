import mongoose from "mongoose";
import { ISubscription } from "../models/SubscriptionModel";
import { ISubscriptionRepository } from "../repositories/interface/ISubscriptionRepository";
import { IUserSubscriptionRepository } from "../repositories/interface/IUserSubscriptionRepository";
import { HttpError } from "../utils/HttpError";
import { IUserSubscriptionService } from "./interface/IUserSubscriptionService";
import * as crypto from "crypto";
import { IUserSubscription } from "../models/UserSubscriptionModel";
import { IMailService } from "./interface/IMailService";
import { IUserRepository } from "../repositories/interface/IUserRepository";


export class UserSubscriptionService implements IUserSubscriptionService {
    constructor(
        private readonly userSubscriptionRepo: IUserSubscriptionRepository,
        private readonly subscriptionRepo: ISubscriptionRepository,
        private readonly mailService: IMailService,
        private readonly userRepository: IUserRepository,
    ) { }

    async findUserSubscription(userId: string): Promise<ISubscription> {
        try {
            const userPlanId = (await this.userSubscriptionRepo.findOne({ userId })).planId.toString()
            if (!userPlanId) {
                throw new HttpError(404, "User Plan not found!")
            }

            const subscription = await this.subscriptionRepo.findById(userPlanId)
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
            const userPlan = await this.userSubscriptionRepo.findOne({ userId })
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
        userId: string, planId: string): Promise<IUserSubscription> {
        try {
            const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_SECRET_ID!)
                .update(sign, "utf-8")
                .digest("hex");

            if (razorpay_signature !== expectedSign) {
                throw new HttpError(400, "Invalid payment signature");
            }

            const currUserSUb = await this.userSubscriptionRepo.findOne({ userId })
            const user = await this.userRepository.findById(userId)
            const newPlan = await this.subscriptionRepo.findById(planId)
            if (!newPlan) throw new HttpError(404, "Plan is not found!")

            const now = new Date()
            let startDate = now
            let endDate = new Date(now)

            const currentPlan = await this.subscriptionRepo.findById(String(currUserSUb.planId))
            if (!currentPlan) throw new HttpError(404, "current plan not found!")

            let subject = '';
            let message = '';

            if (newPlan.pricePerMonth > currentPlan.pricePerMonth) {
                subject = `You've Upgraded to ${newPlan.name}!`;
                message = `Congratulations! You have successfully upgraded to the ${newPlan.name} plan. Premium features will be available after your current plan ends.`;
            } else if (newPlan.pricePerMonth < currentPlan.pricePerMonth) {
                subject = `You've Downgraded to ${newPlan.name}`;
                message = `Your subscription has been changed to the ${newPlan.name} plan. New limits will apply after your current plan expires.`;
            } else {
                subject = `Your Plan Has Been Updated`;
                message = `Your subscription remains on the ${newPlan.name} plan.`;
            }


            // Decide Upgrade / Renewal / Downgrade
            if (!currUserSUb || !currUserSUb.planId) {
                endDate.setMonth(endDate.getMonth() + 1)
                currUserSUb.planId = new mongoose.Types.ObjectId(planId)
            } else {


                if (newPlan.pricePerMonth > currentPlan.pricePerMonth) {
                    // upgrade immediatly
                    startDate = now
                    endDate.setMonth(now.getMonth() + 1)
                    currUserSUb.planId = newPlan.id
                    await this.mailService.sendCommonEmail(user.email, subject, message)
                } else if (newPlan.id === currentPlan.id) {
                    // renewing check if expired 
                    if (currUserSUb.endDate && currUserSUb.endDate > now) {
                        startDate = currUserSUb.startDate
                        endDate = new Date(currUserSUb.endDate)
                        endDate.setMonth(endDate.getMonth() + 1)
                    } else {
                        endDate.setMonth(endDate.getMonth() + 1)
                    }
                    currUserSUb.planId = new mongoose.Types.ObjectId(planId)

                } else if (newPlan.pricePerMonth < currentPlan.pricePerMonth) {
                    // downgrade do it for later
                    currUserSUb.nextPlan = new mongoose.Types.ObjectId(planId)
                    startDate = currUserSUb.startDate;
                    endDate = currUserSUb.endDate
                    await this.mailService.sendCommonEmail(user.email, subject, message)
                }
            }

            const userSubscription = await this.userSubscriptionRepo.findOneAndUpdate(
                { userId },
                {
                    planId: currUserSUb.planId,
                    nextPlan: currUserSUb.nextPlan ?? null,
                    startDate,
                    endDate,
                    isActive: true,
                    paymentOptions: {
                        paymentTime: new Date(),
                        paymentMethod: "Razorpay"
                    }
                },
                { new: true }
            );

            return userSubscription;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error
            }

            throw new HttpError(500, "Error while Verifing user subscription")
        }
    }

    async applyDowngrade(): Promise<void> {
        try {
            const now = new Date()
            const freeId = (await this.subscriptionRepo.findOne({ name: "Free" })).id
            const expiredSubscriptions = await this.userSubscriptionRepo.find({ endDate: { $lt: now }, isActive: true })
            for (const sub of expiredSubscriptions) {
                if (!sub.nextPlan) {
                    sub.endDate = null
                    sub.startDate = null
                    sub.isActive = true
                    sub.planId = freeId
                } else {
                    const newPlan = await this.subscriptionRepo.findById(String(sub.nextPlan))
                    if (!newPlan) throw new HttpError(404, "New plan is not found!")
                    sub.isActive = true
                    sub.planId = new mongoose.Types.ObjectId(newPlan._id as string)
                    sub.nextPlan = null
                    sub.startDate = now
                    if (sub.endDate) {
                        sub.endDate.setMonth(sub.endDate.getMonth() + 1)
                    } else {
                        sub.endDate = new Date(now)
                        sub.endDate.setMonth(sub.endDate.getMonth() + 1)
                    }
                }

                await this.userSubscriptionRepo.save(sub)

            }
        } catch (error) {
            console.log(error)
            throw new HttpError(500, "Server error, while applying downgrade")
        }
    }

    async downgradeToFreePlan(userId: string): Promise<IUserSubscription> {
        try {
            const userSubscription = await this.userSubscriptionRepo.findOne({ userId })
            const freePlan = await this.subscriptionRepo.findOne({ name: "Free" })
            userSubscription.startDate = null
            userSubscription.endDate = null
            userSubscription.nextPlan = freePlan.id
            userSubscription.isActive = true
            userSubscription.cancelledDate = new Date()

            await userSubscription.save()

            return userSubscription
        } catch (error) {
            console.log(error)
            throw new HttpError(500, "Error while downgrading to Free plan")
        }
    }

    async sendExpiryReminder(): Promise<void> {
        const now = new Date()
        const threeDaysFromNow = new Date()

        threeDaysFromNow.setDate(now.getDate() + 3)

        const expireSoon = await this.userSubscriptionRepo.find({
            endDate: { $gt: now, $lt: threeDaysFromNow },
            isActive: true
        })

        for (const sub of expireSoon) {
            const user = await this.userRepository.findById(String(sub.userId))
            await this.mailService.sendPlanExpiryNotification(user.email, String(sub.endDate))
        }
    }

}