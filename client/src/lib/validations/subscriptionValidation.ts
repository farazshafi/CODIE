
import { z } from 'zod';

export const createSubscription = z.object({
    _id: z.string().optional(),
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

    isVisible: z.boolean().default(true).optional(),
});

export const updateSubscription = createSubscription.partial();

export type UpdateSubscriptionInput = z.infer<typeof updateSubscription>;

export type CreateSubscriptionInput = z.infer<typeof createSubscription>;
