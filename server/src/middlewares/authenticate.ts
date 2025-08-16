import jwt from "jsonwebtoken"
import { ENV } from "../config/env"
import { Request, Response, NextFunction } from "express"
import redis from "../config/redis"

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET)

        const isTokenBlacklisted = await redis.get(`blacklist:${token}`)
        console.log("check is token".yellow, isTokenBlacklisted)
        if (isTokenBlacklisted) {
            res.status(401).json({ message: "Token is blacklisted" });
            return
        }
        req.user = decoded
        next()
    } catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ message: error.message });
        } else {
            res.status(401).json({ message: "Invalid or expired Token" });
        }
    }
}