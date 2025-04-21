import { z } from "zod"


export const createRoomSchema = z.object({
    projectId: z.string()
})