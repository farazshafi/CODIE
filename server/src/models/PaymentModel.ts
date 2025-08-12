import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPaymentBase {
    userId: mongoose.Types.ObjectId;
    subscriptionId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    paymentStatus: "pending" | "completed" | "failed";
    transactionId: string;
    paymentDate: Date;
}

export interface IPayment extends IPaymentBase, Document { }

const PaymentSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: "USD"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export const PaymentModel: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
export default PaymentModel;
