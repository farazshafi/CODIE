import { NextFunction, Request, Response } from "express"
import { userService } from "../container"
import { HttpStatusCode } from "../utils/httpStatusCodes"


export const protect = async (req: Request, res: Response, next: NextFunction) => {
    const tokenUser = req.user
    if (!tokenUser) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" })
        return
    }

    const dbUser = await userService.findUserById(tokenUser.id)

    if (dbUser.isBlocked) {
        res.status(HttpStatusCode.FORBIDDEN).json({ message: "Forbidden: User is Blocked" })
        return
    } else {
        next()
    }
}