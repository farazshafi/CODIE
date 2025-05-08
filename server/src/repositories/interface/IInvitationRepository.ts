import { IInvitation } from "../../models/InvitationModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IInvitationRepository extends IBaseRepository<IInvitation> {
    updateStatus(invitationId: string, status: "pending" | "accepted" | "rejected"): Promise<IInvitation>;
}