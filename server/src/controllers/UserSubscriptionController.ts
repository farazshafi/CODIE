import { NextFunction, Request, Response } from "express";
import { IUserSubscriptionService } from "../services/interface/IUserSubscriptionService";
import { razorpayInstance } from "../config/razorpay";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export class UserSubscriptionController {
    constructor(
        private readonly _userSubscriptionService: IUserSubscriptionService,
    ) { }

    getUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params
            const userPlan = await this._userSubscriptionService.findUserSubscription(userId)
            const userSubsription = await this._userSubscriptionService.getUserSubscription(userId)

            res.status(HttpStatusCode.OK).json({
                text: userPlan.chatSupport.text,
                voice: userPlan.chatSupport.voice,
                id: userPlan.id, name: userPlan.name,
                pricePerMonth: userPlan.pricePerMonth,
                maxPrivateProjects: userPlan.maxPrivateProjects,
                nextPlanId: userSubsription.nextPlan,
                endDate: userSubsription.endDate,
                startDate: userSubsription.startDate,
            })
        } catch (error) {
            next(error)
        }
    }

    subscribeToPlan = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { amount, currency } = req.body

            const options = {
                amount: amount * 100, // by default it treat as paisa
                currency: currency || "INR",
            }

            const { id } = await razorpayInstance.orders.create(options)
            res.status(HttpStatusCode.OK).json({ id, amount, currency })

        } catch (error) {
            next(error)
        }
    }

    verifyPaymentAndUpdateUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId, amount } = req.body

            const userSub = await this._userSubscriptionService.verifyPaymentAndUpdateUserSubscription(razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId, amount)

            res.status(HttpStatusCode.OK).json({ userSub, message: "Successfully Subscribed, To see details navigate to profile" })

        } catch (error) {
            next(error)
        }
    }

    downgradeToFree = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.body
            if (!userId) res.status(HttpStatusCode.BAD_REQUEST).json({ message: "UserId required!" })

            const userSub = await this._userSubscriptionService.downgradeToFreePlan(userId)

            res.status(HttpStatusCode.OK).json({ userSub, message: "Successfully Subscribed, To see details navigate to profile" })
        } catch (error) {
            next(error)
        }
    }

    getUserAiUsage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id

            const userSub = await this._userSubscriptionService.getAiUsage(userId)

            res.status(HttpStatusCode.OK).json(userSub)
        } catch (error) {
            next(error)
        }
    }
}