import { NextFunction, Request, Response } from "express";


export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const tokenUser = req.user

    if (!tokenUser) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    if (!tokenUser.isAdmin) {
        res.status(403).json({ message: "Forbidden: Admins only" })
        return
    }
    next()
}