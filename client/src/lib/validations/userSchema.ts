import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters long"),
    email: z.string().email("Invalid email format"),
    isAdmin: z.boolean().default(false),
    isBlocked: z.boolean().default(false),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
});


export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
})
