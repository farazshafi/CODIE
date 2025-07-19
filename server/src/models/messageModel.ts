import mongoose, { Schema, Document } from "mongoose";

// interface
export interface IMessageBase {
    roomId: string;
    senderId: string;
    senderName: string;
    senderRole: 'owner' | 'editor' | 'viewer';
    content: string;
}
export interface IMessage extends IMessageBase, Document { }

// schema
const messageSchema: Schema = new mongoose.Schema({
    roomId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String },
    content: { type: String, required: true },
    senderRole: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
}, { timestamps: true });

// model
export const MessageModel = mongoose.models.Messages || mongoose.model<IMessage>("Messages", messageSchema)