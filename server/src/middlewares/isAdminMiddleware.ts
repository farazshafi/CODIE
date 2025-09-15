import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const tokenUser = req.user

    if (!tokenUser) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" })
        return
    }

    if (!tokenUser.isAdmin) {
        res.status(HttpStatusCode.FORBIDDEN).json({ message: "Forbidden: Admins only" })
        return
    }
    next()
}