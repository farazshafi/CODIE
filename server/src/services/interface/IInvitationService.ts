import { IInvitation } from "../../models/InvitationModel";


export interface IInvitationService {
    createInvitation(senderId: string, reciverId: string, roomId: string): Promise<IInvitation>;
    isInvitaionExist(reciverId: string, roomId: string): Promise<boolean>;
}