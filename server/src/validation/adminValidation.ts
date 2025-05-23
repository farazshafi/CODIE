
import { z } from "zod"

export const updateStatusBlockUnblock = z.object({
    userId: z.string(),
    status: z.enum(["active", "suspend"])
})