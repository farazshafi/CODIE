import { string, z } from "zod";

//update code valiation
export const updateCodeSchema = z.object({
    projectId: string(),
    code: string()
})