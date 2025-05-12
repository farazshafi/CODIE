import { Model } from "mongoose";
import { IInvitation } from "../models/InvitationModel";
import { BaseRepository } from "./baseRepository";
import { IInvitationRepository } from "./interface/IInvitationRepository";


export class InvitationRepository extends BaseRepository<IInvitation> implements IInvitationRepository {

    constructor(model: Model<IInvitation>) {
        super(model)
    }

    async updateStatus(invitationId: string, status: "pending" | "accepted" | "rejected"): Promise<IInvitation> {
        return this.model.findByIdAndUpdate(invitationId, { status }, { new: true })
    }

    async getAllRecivedInvitations(id: string): Promise<IInvitation[]> {
        return await this.model.find({ reciverId: id, status: "pending" }, "senderId roomId").populate("senderId", "name");
    }

}