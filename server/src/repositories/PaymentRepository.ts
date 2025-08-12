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
}
