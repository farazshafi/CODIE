import mongoose, { Document } from "mongoose";
export interface IRequest extends Document {
    roomId: mongoose.Schema.Types.ObjectId;
    senderId: mongoose.Schema.Types.ObjectId;
    reciverId: mongoose.Schema.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface IMakeRequest {
    senderId: string;
    roomId: string;
    reciverId: string;
}