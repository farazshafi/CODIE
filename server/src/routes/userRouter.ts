import { Router } from "express"
import { createUser } from "../controllers/userController"
import { ENV } from "../config/env"
import { refreshToken } from "./auth"

const router = Router()

router.post("/register", createUser) 
router.get("/", (req, res) => {
    res.send(`Api is running on port ${ENV.PORT}`)
})
router.get("/auth/refresh-token",refreshToken)


export default router