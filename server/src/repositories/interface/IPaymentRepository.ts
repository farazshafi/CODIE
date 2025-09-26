import { Model } from "mongoose";
import { IPayment } from "../../models/PaymentModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IPaymentRepository extends IBaseRepository<IPayment> {
    getModel(): Model<IPayment>;
    getMonthlyRevenue(monthsBack: number): Promise<{ month: string; year: number; revenue: number }[]>
}
