import { NextFunction, Request, Response } from "express";
import { userService } from "../container";


export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const tokenUser = req.user
    if (!tokenUser) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    const dbUser = await userService.findUserById(tokenUser.id)

    if (!dbUser || !dbUser.isAdmin) {
        res.status(403).json({ message: "Forbidden: Admins only" })
        return
    }
    next()
}