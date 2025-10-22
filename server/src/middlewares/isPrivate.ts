import { NextFunction, Request, Response } from "express";
import { userService } from "../container";
import { HttpStatusCode } from "../utils/httpStatusCodes";


export const isPrivate = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const paramsId = req.params.userId
    const user = await userService.findUserById(paramsId)

    console.log("userId".blue, userId, " paramsId: ".blue, paramsId)
    console.log("user: ", user)

    if (paramsId !== userId) {
        if (user.isPublic) {
            next()
        } else {
            res.status(HttpStatusCode.FORBIDDEN).json({ message: "User account is Private" })
            return
        }
    } else {
        next()
    }
}