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


}
