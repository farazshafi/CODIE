import jwt from "jsonwebtoken"
import { ENV } from "../config/env"

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const token = authHeader.split(" ")[1]

    try{
        const decoded = jwt.verify(token,ENV.ACCESS_TOKEN_SECRET)
        req.user = decoded
        next()
    }catch(error){
        return res.status(403).json({message: "Invalid or expired Token"})
    }
}