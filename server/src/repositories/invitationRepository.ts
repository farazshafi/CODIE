import { Model } from "mongoose";
import { IInvitation, IInvitationBase } from "../models/InvitationModel";
import { BaseRepository } from "./baseRepository";
import { IInvitationRepository } from "./interface/IInvitationRepository";


export class InvitationRepository extends BaseRepository<IInvitation> implements IInvitationRepository {

    constructor(model: Model<IInvitation>) {
        super(model)
    }

    async updateStatus(
        invitationId: string,
        status: "pending" | "accepted" | "rejected"
    ): Promise<IInvitation> {
        const update: Partial<IInvitationBase> & { statusChangedAt?: Date | null } = { status };

        if (status === "accepted" || status === "rejected") {
            update.statusChangedAt = new Date();
        } else {
            update.statusChangedAt = null;
        }

        return await this.model.findByIdAndUpdate(invitationId, update, { new: true });

    }


    async getAllRecivedInvitations(id: string): Promise<IInvitation[]> {
        return await this.model.find({ reciverId: id, status: "pending" }, "senderId roomId").populate("senderId", "name");
    }

}