import { NextFunction, Request, Response } from "express";
import { ISubscriptionService } from "../services/interface/ISubscriptionService";


export class SubscriptionController {
    constructor(
        private readonly subscriptionService: ISubscriptionService,
    ) { }

    createSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body
            const newSubscription = await this.subscriptionService.createSubscription(data)
            res.status(201).json({ message: "Subscription created", newSubscription })
        } catch (error) {
            next(error)
        }
    }

    deleteSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            await this.subscriptionService.deleteSubscription(id)
            res.status(200).json({ message: "Subscription Deleted" })
        } catch (error) {
            next(error)
        }
    }

    getAllSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allSubscription = await this.subscriptionService.getAllSubscription()
            res.status(200).json({ message: "Subscription Found", allSubscription })
        } catch (error) {
            next(error)
        }
    }

    updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedSubscription = await this.subscriptionService.updateSubscription(id, data);
            res.status(200).json({ message: "Subscription Updated", updatedSubscription });
        } catch (error) {
            next(error);
        }
    }
}