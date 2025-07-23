import { NextFunction, Request, Response } from "express";
import { ISubscriptionService } from "../services/interface/ISubscriptionService";
import mongoose from "mongoose";


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
            const { page = 1, limit = 5, search = '', status = "all" } = req.query;

            const pageNumber = parseInt(page as string);
            const pageSize = parseInt(limit as string);
            const searchQuery = search.toString();

            const filter: any = {};

            if (searchQuery) {
                const isValidObjectId = mongoose.Types.ObjectId.isValid(searchQuery);

                filter.$or = [
                    { name: { $regex: searchQuery, $options: "i" } },
                ];

                if (isValidObjectId) {
                    filter.$or.push({ _id: new mongoose.Types.ObjectId(searchQuery) });
                }
            }

            if (status === 'active') {
                filter.isVisible = true;
            } else if (status === 'suspended') {
                filter.isVisible = false;
            }

            const subscriptions = await this.subscriptionService.findSubscriptionsWithPagination(filter, pageNumber, pageSize);
            const totalUsers = await this.subscriptionService.countSubscription(filter)

            res.status(200).json({
                message: "Subscription Found",
                subscriptions,
                pagination: {
                    total: totalUsers,
                    page: pageNumber,
                    limit: pageSize,
                    totalPages: Math.ceil(totalUsers / pageSize)
                }
            })
        } catch (error) {
            next(error);
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

    blockUnblock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, status } = req.body;
            const subscription = this.subscriptionService.findById(id)
            if (!subscription) {
                res.status(404).json({ message: "Subscription not found" })
                return
            }

            if (status === "suspend") {
                await this.subscriptionService.blockSubscription(id)
                res.status(200).json({ message: "User Blocked Successfully" })
                return
            } else if (status === "active") {
                await this.subscriptionService.unblockSubscription(id)
                res.status(200).json({ message: "User Unblocked Successfully" })
                return
            }
        } catch (error) {
            next(error);
        }
    }

    getSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const subscriptions = await this.subscriptionService.getSubscription();

            const transformed = subscriptions.map(sub => {
                const features: string[] = [];
                const notAvailable: string[] = [];

                if (sub.chatSupport?.text) {
                    features.push("Chat");
                } else {
                    notAvailable.push("Chat");
                }

                if (sub.chatSupport?.voice) {
                    features.push("Voice");
                } else {
                    notAvailable.push("Voice");
                }

                if (sub.aiFeature?.codeSuggestion) {
                    features.push("AI Suggestions");
                } else {
                    notAvailable.push("AI Suggestions");
                }

                if (sub.aiFeature?.codeExplanation) {
                    features.push("AI Explanations");
                } else {
                    notAvailable.push("AI Explanations");
                }

                features.push(
                    `${sub.maxPrivateProjects} private projects`,
                    `${sub.maxCollaborators} collaborators`,
                    `${sub.limits.codeExecutionsPerDay} code executions/day`
                );

                return {
                    name: sub.name,
                    pricePerMonth: sub.pricePerMonth,
                    features,
                    notAvailable
                };
            });

            res.status(200).json(transformed);
        } catch (error) {
            next(error);
        }
    };



}