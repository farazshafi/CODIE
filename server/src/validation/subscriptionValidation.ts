import { z } from "zod";

export const createSubscription = z.object({
    name: z.enum(['Free', 'Pro', 'Team', 'Enterprise']),
    pricePerMonth: z.number().nonnegative(),
    maxPrivateProjects: z.number().int(),
    maxCollaborators: z.number().int(),

    chatSupport: z.object({
        text: z.boolean(),
        voice: z.boolean(),
    }),

    aiFeature: z.object({
        codeSuggestion: z.boolean(),
        codeExplanation: z.boolean(),
    }),

    limits: z.object({
        codeExecutionsPerDay: z.number().int(),
    }),
});

export const verifySubscription = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    userId: z.string(),
    planId: z.string()

})

export const updateSubscription = createSubscription.partial();

export type UpdateSubscriptionInput = z.infer<typeof updateSubscription>;

export type CreateSubscriptionInput = z.infer<typeof createSubscription>;
