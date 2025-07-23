import { NextFunction, Request, Response } from "express";
import { IUserSubscriptionService } from "../services/interface/IUserSubscriptionService";


export class UserSubscriptionController {
    constructor(
        private readonly userSubscriptionService: IUserSubscriptionService,
    ) { }

    getUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params
            const userPlan = await this.userSubscriptionService.findUserSubscription(userId)

            res.status(200).json(userPlan.chatSupport)
        } catch (error) {
            next(error)
        }
    }
}