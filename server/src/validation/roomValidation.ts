import { z } from "zod"


export const createRoomSchema = z.object({
    projectId: z.string()
})

export const updateRoleSchema = z.object({
    roomId: z.string(),
    userId: z.string(),
    role: z.enum(["viewer", "editor"])
})

export const checkPermissionSchema = z.object({
    userId: z.string(),
    roomId: z.string(),
})

export const remove_from_project_Schema = z.object({
    userId: z.string(),
    projectId: z.string(),
})