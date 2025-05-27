import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriptionBase {
    name: string;
    pricePerMonth: number;
    maxPrivateProjects: number;
    maxCollaborators: number;
    chatSupport: {
        text: boolean;
        voice: boolean;
    };
    aiFeature: {
        codeSuggestion: boolean;
        codeExplanation: boolean;
    },
    limits: {
        codeExecutionsPerDay: number
    },
    isVisible: boolean;
}

export interface ISubscription extends ISubscriptionBase, Document { }


const SubscriptionSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['Free', 'Pro', 'Team', 'Enterprise']
    },
    pricePerMonth: {
        type: Number,
        required: true,
        min: 0
    },
    maxPrivateProjects: {
        type: Number,
        required: true
    },
    maxCollaborators: {
        type: Number,
        required: true
    },
    chatSupport: {
        text: {
            type: Boolean,
            default: false
        },
        voice: {
            type: Boolean,
            default: false
        }
    },
    aiFeature: {
        codeSuggestion: {
            type: Boolean,
            default: false
        },
        codeExplanation: {
            type: Boolean,
            default: false
        }
    },
    limits: {
        codeExecutionsPerDay: {
            type: Number,
            required: true
        }
    },
    isVisible: {
        type: Boolean,
        default: true
    }
});


export const SubscriptionModel = mongoose.model<ISubscription>("Subscription", SubscriptionSchema)
export default SubscriptionModel

