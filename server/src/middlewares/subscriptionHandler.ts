import { NextFunction, Request, Response } from "express";
import { userSubscriptionService } from "../container";


export const aiAccess = async (req: Request, res: Response, next: NextFunction) => {
    const tokenUser = req.user
    if (!tokenUser) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    const userSubsciption = await userSubscriptionService.findUserSubscription(tokenUser.id)
    if (!userSubsciption.aiFeature.codeExplanation) {
        res.status(403).json({ message: "AI code explanation feature is not available in your subscription." })
        return
    }
    next()

}

export const checkUserSubscriptoin = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user
    if (!token) {
        res.status(401).json({ message: "Unauthorized" })
    }

    const userSubscription = await userSubscriptionService.getUserSubscription(token.id)
    if (!userSubscription || !userSubscription.isActive) {
        res.status(403).json({ message: "Your subscription is inactive or not found." })
        return
    }
    const subscription = await userSubscriptionService.findUserSubscription(token.id)
    const getUserSub = await userSubscriptionService.getUserSubscription(token.id)

    const now = new Date();
    const endDate = new Date(userSubscription.endDate);

    if (userSubscription.endDate !== null && now.getTime() > endDate.getTime()) {
        await userSubscriptionService.applyDowngrade()
        res.status(403).json({
            message: "Your subscription has expired.", subscription: {
                name: subscription.name,
                text: subscription.chatSupport.text,
                voice: subscription.chatSupport.voice,
                id: subscription.id,
                pricePerMonth: subscription.pricePerMonth,
                maxPrivateProjects: subscription.maxPrivateProjects,
                nextPlanId: getUserSub.nextPlan,
                endDate: getUserSub.endDate
            }
        });
        return
    }


    next()
}