import { z } from "zod";


export const createInvitationValidation = z.object({
    roomId: z.string(),
    senderId: z.string(),
    reciverId: z.string()
})