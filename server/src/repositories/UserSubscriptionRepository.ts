import mongoose, { Model } from "mongoose";
import UserSubscriptionModel, { IUserSubscription } from "../models/UserSubscriptionModel";
import { BaseRepository } from "./BaseRepository";
import { IUserSubscriptionRepository } from "./interface/IUserSubscriptionRepository";


export class UserSubscriptionRepository extends BaseRepository<IUserSubscription> implements IUserSubscriptionRepository {
    constructor(model: Model<IUserSubscription>) {
        super(model)
    }

    async createSubscriptionWhenUserRegister(userId: string, planId: string): Promise<IUserSubscription> {
        const user = new mongoose.Types.ObjectId(userId)
        const plan = new mongoose.Types.ObjectId(planId)
        return await UserSubscriptionModel.create({ userId: user, planId: plan })
    }

    async getSubscriptionHistory(params: {
        year?: number;
        month?: number;
        sort?: string;
        currentPage?: number;
        limit?: number;
        search?: string;
    }): Promise<any> {
        console.log("params current page: ".yellow,params.currentPage)
        const { year, month, sort, search } = params;
        const limit = Number(params.limit) || 10;
        const currentPage = Number(params.currentPage) || 1;
        const skip = (currentPage - 1) * limit;

        const pipeline: any[] = [];

        const matchConditions: any = {};

        // Filter by year
        if (year) {
            matchConditions.$expr = { $eq: [{ $year: "$startDate" }, year] };
        }

        // Filter by month
        if (month) {
            matchConditions.$expr = matchConditions.$expr
                ? { $and: [matchConditions.$expr, { $eq: [{ $month: "$startDate" }, month] }] }
                : { $eq: [{ $month: "$startDate" }, month] };
        }

        // Filter by status
        if (sort === "active") {
            matchConditions.isActive = true;
        } else if (sort === "expired") {
            matchConditions.isActive = false;
        }

        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({ $match: matchConditions });
        }

        pipeline.push(
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "planId",
                    foreignField: "_id",
                    as: "plan",
                },
            },
            { $unwind: "$plan" }
        );

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "user.name": { $regex: search, $options: "i" } },
                        { "user.email": { $regex: search, $options: "i" } },
                        { "plan.name": { $regex: search, $options: "i" } },
                    ],
                },
            });
        }

        pipeline.push(
            {
                $lookup: {
                    from: "payments",
                    let: { userId: "$userId", planId: "$planId", startDate: "$startDate" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", "$$userId"] },
                                        { $eq: ["$subscriptionId", "$$planId"] },
                                        { $gte: ["$paymentDate", "$$startDate"] },
                                    ],
                                },
                            },
                        },
                        { $sort: { paymentDate: 1 } },
                        { $limit: 1 },
                    ],
                    as: "paymentInfo",
                },
            },
            {
                $unwind: {
                    path: "$paymentInfo",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    user: "$user.name",
                    email: "$user.email",
                    plan: "$plan.name",
                    amount: { $ifNull: ["$paymentInfo.amount", "$plan.pricePerMonth"] },
                    status: { $cond: { if: "$isActive", then: "active", else: "expired" } },
                    startDate: 1,
                    endDate: 1,
                },
            }
        );

        // Clone pipeline for counting total docs
        const countPipeline = [...pipeline, { $count: "total" }];
        const totalResult = await this.model.aggregate(countPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        // Add pagination to main pipeline
        pipeline.push({ $skip: skip }, { $limit: limit });

        const subscriptions = await this.model.aggregate(pipeline);

        return {
            subscriptions,
            totalPages,
            currentPage,
            totalItems: total,
        };
    }
}