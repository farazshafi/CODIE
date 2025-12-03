import mongoose, { FilterQuery, Model, PipelineStage } from "mongoose";
import UserSubscriptionModel, { IUserSubscription } from "../models/UserSubscriptionModel";
import { BaseRepository } from "./BaseRepository";
import { IUserSubscriptionRepository } from "./interface/IUserSubscriptionRepository";

export interface GetSubscriptionHistoryParams {
    year?: number;
    month?: number;
    sort?: string;
    currentPage?: number;
    limit?: number;
    search?: string;
}

export interface SubscriptionAggregationResult {
    user: string;
    email: string;
    plan: string;
    amount: number;
    status: "active" | "expired";
    startDate?: Date;
    endDate?: Date;
}

export interface GetSubscriptionHistoryResult {
    subscriptions: SubscriptionAggregationResult[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

export class UserSubscriptionRepository extends BaseRepository<IUserSubscription> implements IUserSubscriptionRepository {
    constructor(model: Model<IUserSubscription>) {
        super(model)
    }

    async createSubscriptionWhenUserRegister(userId: string, planId: string): Promise<IUserSubscription> {
        const user = new mongoose.Types.ObjectId(userId)
        const plan = new mongoose.Types.ObjectId(planId)
        return await UserSubscriptionModel.create({ userId: user, planId: plan })
    }

    async getSubscriptionHistory(params: GetSubscriptionHistoryParams): Promise<GetSubscriptionHistoryResult> {
        console.log("params current page: ".yellow, params.currentPage);

        const { year, month, sort, search } = params;
        const limit = Number(params.limit) || 10;
        const currentPage = Number(params.currentPage) || 1;
        const skip = (currentPage - 1) * limit;

        const pipeline: PipelineStage[] = [];

        const matchConditions: FilterQuery<Document> = {};

        // Filter by year
        if (year !== undefined) {
            // Use $expr for year comparison
            matchConditions.$expr = { $eq: [{ $year: "$startDate" }, year] } as unknown as FilterQuery<Document>;
        }

        // Filter by month
        if (month !== undefined) {
            const monthExpr = { $eq: [{ $month: "$startDate" }, month] } as unknown as FilterQuery<Document>;
            matchConditions.$expr = matchConditions.$expr
                ? { $and: [matchConditions.$expr, monthExpr] } as unknown as FilterQuery<Document>
                : monthExpr;
        }

        // Filter by status (active / expired)
        if (sort === "active") {
            matchConditions.isActive = true;
        } else if (sort === "expired") {
            matchConditions.isActive = false;
        }
        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({ $match: matchConditions });
        }

        // Lookups and unwinds
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

        // Search across user.name, user.email, plan.name
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "user.name": { $regex: search, $options: "i" } },
                        { "user.email": { $regex: search, $options: "i" } },
                        { "plan.name": { $regex: search, $options: "i" } },
                    ],
                },
            } as PipelineStage);
        }

        // Lookup the first payment after (or on) startDate for this subscription
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
            } as PipelineStage,
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
            } as PipelineStage
        );

        // Count total documents matching the pipeline (clone pipeline)
        const countPipeline: PipelineStage[] = [...pipeline, { $count: "total" }];

        const totalResult = (await this.model.aggregate<CountResult>(countPipeline)) ?? [];
        const total = totalResult.length > 0 ? Number(totalResult[0].total) : 0;
        const totalPages = Math.ceil(total / limit);

        // add pagination stages to main pipeline
        pipeline.push({ $skip: skip }, { $limit: limit });

        // Projected subscription entries
        const subscriptions = (await this.model.aggregate<SubscriptionAggregationResult>(pipeline)) ?? [];

        return {
            subscriptions,
            totalPages,
            currentPage,
            totalItems: total,
        };
    }
}