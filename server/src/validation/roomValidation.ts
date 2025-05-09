import { z } from "zod"


export const createRoomSchema = z.object({
    projectId: z.string()
})

export const updateRoleSchema = z.object({
    roomId: z.string(),
    userId: z.string(),
    role: z.enum(["viewer", "editor"])
})