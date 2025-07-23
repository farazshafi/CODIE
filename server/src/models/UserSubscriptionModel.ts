import mongoose, { Document, Model, Schema } from "mongoose";


export interface IUserSubscriptionBase {
    userId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
    paymentOptions: {
        paymentTime: Date | null;
        paymentMethod: string;
    };
    cancelledDate: Date | null;
}

export interface IUserSubscription extends IUserSubscriptionBase, Document { }


export interface IUserSubscription extends IUserSubscriptionBase, Document { }

const userSubscriptionSchema: Schema<IUserSubscription> = new Schema<IUserSubscription>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null},
    isActive: { type: Boolean, default: true },
    paymentOptions: {
        paymentTime: { type: Date, default: null },
        paymentMethod: { type: String, default: "Free" },
    },
    cancelledDate: { type: Date, default: null },
}, {
    timestamps: true
});


export const UserSubscriptionModel: Model<IUserSubscription> = mongoose.models.UserSubscription || mongoose.model<IUserSubscription>("UserSubscription", userSubscriptionSchema);
export default UserSubscriptionModel