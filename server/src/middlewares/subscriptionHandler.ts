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