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

    async yearlySalesReport(): Promise<{ revenue: number, year: number }[]> {
        const yearlyData = await this.model.aggregate([
            { $match: { paymentStatus: "completed" } },
            {
                $group: {
                    _id: { year: { $year: "$paymentDate" } },
                    revenue: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.year": 1 } },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    revenue: 1,
                },
            },
        ]);

        if (!yearlyData || yearlyData.length === 0) return [];

        const map = new Map<number, number>();
        yearlyData.forEach((r: any) => map.set(Number(r.year), Number(r.revenue ?? 0)));

        const years = Array.from(map.keys());
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years, new Date().getFullYear());

        const result: { revenue: number; year: number }[] = [];
        for (let y = minYear; y <= maxYear; y++) {
            result.push({ year: y, revenue: map.get(y) ?? 0 });
        }

        return result;
    }

    async monthlySalesReport(year: number): Promise<{ revenue: number; month: string }[]> {
        const monthlyData = await this.model.aggregate([
            {
                $match: {
                    paymentStatus: "completed",
                    paymentDate: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { month: { $month: "$paymentDate" } },
                    revenue: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.month": 1 } },
            {
                $project: {
                    _id: 0,
                    monthNumber: "$_id.month",
                    revenue: 1,
                },
            },
        ]);

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const map = new Map<number, number>();
        (monthlyData || []).forEach((r: any) => {
            const mnum = Number(r.monthNumber);
            map.set(mnum, Number(r.revenue ?? 0));
        });

        const result: { revenue: number; month: string }[] = [];
        for (let m = 1; m <= 12; m++) {
            result.push({
                month: monthNames[m - 1],
                revenue: map.get(m) ?? 0,
            });
        }

        return result;
    }

    async dailySalesReport(year: number, month: number): Promise<{ revenue: number, year: number }[]> {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const dailyData = await this.model.aggregate([
            {
                $match: {
                    paymentStatus: "completed",
                    paymentDate: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: { day: { $dayOfMonth: "$paymentDate" } },
                    revenue: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.day": 1 } },
            {
                $project: {
                    _id: 0,
                    day: "$_id.day",
                    revenue: 1,
                },
            },
        ]);

        const daysInMonth = end.getDate();

        const map = new Map<number, number>();
        (dailyData || []).forEach((r: any) => {
            const d = Number(r.day);
            map.set(d, Number(r.revenue ?? 0));
        });

        const result: { revenue: number; year: number }[] = [];
        for (let d = 1; d <= daysInMonth; d++) {
            result.push({
                day: d,
                revenue: map.get(d) ?? 0,
            });
        }

        return result;
    }

    async salesReportByDate(date: string): Promise<{ revenue: number; date: string }> {
        const targetDate = new Date(date);

        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const report = await this.model.aggregate([
            {
                $match: {
                    paymentStatus: "completed",
                    paymentDate: { $gte: startOfDay, $lte: endOfDay },
                },
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$amount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: date,
                    revenue: 1,
                },
            },
        ]);

        return report[0] || { revenue: 0, date };
    }

}
