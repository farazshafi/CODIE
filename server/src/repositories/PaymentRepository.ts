import { Model } from "mongoose";
import { IPayment } from "../models/PaymentModel";
import { BaseRepository } from "./BaseRepository";
import { IPaymentRepository } from "./interface/IPaymentRepository";

export class PaymentRepository extends BaseRepository<IPayment> implements IPaymentRepository {
    constructor(model: Model<IPayment>) {
        super(model);
    }

    getModel(): Model<IPayment> {
        return this.model
    }

    async getMonthlyRevenue(monthsBack: number = 6): Promise<{ month: string; year: number; revenue: number }[]> {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);

        const data = await this.model.aggregate([
            {
                $match: {
                    paymentStatus: 'completed',
                    paymentDate: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return data.map(d => {
            const monthName = new Date(d._id.year, d._id.month - 1, 1).toLocaleString('default', { month: 'short' });
            return {
                month: monthName,
                year: d._id.year,
                revenue: d.revenue
            };
        });
    }

    async getRevenueByYear(year: number): Promise<{ month: string, revenue: number }[]> {
        const now = new Date();
        const currentMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;
        const revenueData = await this.model.aggregate([
            {
                $match: {
                    paymentStatus: "completed",
                    paymentDate: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$paymentDate" },
                    revenue: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    revenue: 1
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const result = monthNames.slice(0, currentMonth).map((name, index) => {
            const monthData = revenueData.find(d => d.month === index + 1);
            return { month: name, revenue: monthData ? monthData.revenue : 0 };
        });

        return result;
    }

    async getMontlyDataForGraphOverview(year: number): Promise<{ _id: number, total: number }[]> {
        return await this.model.aggregate([
            {
                $match: {
                    paymentStatus: "completed",
                    paymentDate: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$paymentDate" },
                    total: { $sum: "$amount" }
                }
            }
        ]);

    }

    async getYearlyDataForGraphOverview(): Promise<{ _id: number, total: number }[]> {
        return await this.model.aggregate([
            {
                $match: { paymentStatus: "completed" }
            },
            {
                $group: {
                    _id: { $year: "$paymentDate" },
                    total: { $sum: "$amount" }
                }
            }
        ]);
    }
}
