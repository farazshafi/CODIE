import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters long"),
    email: z.string().email("Invalid email format"),
    isAdmin: z.boolean().default(false),
    isBlocked: z.boolean().default(false),
    bio: z.string().default(null).optional(),
    avatarUrl: z.string().url().default("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcDdrIJuxsoeWIjwPqSfcL9PFqVdc5-F6Urm4CjOcfCMPH752K-36Xj0tjyazZqKWWk8g").optional(),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
});

export const googleAuthSchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters long"),
    email: z.string().email("Invalid email format"),
    isAdmin: z.boolean().default(false),
    isBlocked: z.boolean().default(false),
    googleId: z.string().min(1, "Google ID is required"),
    avatarUrl: z.string().url().optional()
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
})

export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;