import { NextFunction, Request, Response } from "express";
import { IUserSubscriptionService } from "../services/interface/IUserSubscriptionService";
import { razorpayInstance } from "../config/razorpay";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";


export class UserSubscriptionController {
    constructor(
        private readonly _userSubscriptionService: IUserSubscriptionService,
    ) { }

    getUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params
            const userPlan = await this._userSubscriptionService.findUserSubscription(userId)
            const userSubsription = await this._userSubscriptionService.getUserSubscription(userId)

            const response = new ApiResponse(HttpStatusCode.OK, {
                text: userPlan.chatSupport.text,
                voice: userPlan.chatSupport.voice,
                id: userPlan.id, name: userPlan.name,
                pricePerMonth: userPlan.pricePerMonth,
                maxPrivateProjects: userPlan.maxPrivateProjects,
                nextPlanId: userSubsription.nextPlan,
                endDate: userSubsription.endDate,
                startDate: userSubsription.startDate,
            }, "Fetched User subscription")
            res.status(response.statusCode).json(response)

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
            const response = new ApiResponse(HttpStatusCode.CREATED, { id, amount, currency }, "Successfully Subscribed")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    verifyPaymentAndUpdateUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId, amount } = req.body

            const userSub = await this._userSubscriptionService.verifyPaymentAndUpdateUserSubscription(razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId, amount)

            const response = new ApiResponse(HttpStatusCode.OK, userSub, "Successfully Subscribed To see details navigate to profile.")
            res.status(response.statusCode).json(response)

        } catch (error) {
            next(error)
        }
    }

    downgradeToFree = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.body
            if (!userId) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "User id is required")
                res.status(response.statusCode).json(response)
            }

            const userSub = await this._userSubscriptionService.downgradeToFreePlan(userId)

            const response = new ApiResponse(HttpStatusCode.OK, userSub, "Successfully Subscribed To see details navigate to profile.")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    getUserAiUsage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id

            const aiUsage = await this._userSubscriptionService.getAiUsage(userId)

            const response = new ApiResponse(HttpStatusCode.OK, aiUsage, "Successfully Fetched ai usage.")
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }
}