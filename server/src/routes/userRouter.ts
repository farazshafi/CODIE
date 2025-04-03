import { Router } from "express"
import { createUser } from "../controllers/userController"
import { ENV } from "../config/env"

const router = Router()

router.post("/users", createUser)
router.get("/", (req, res) => {
    res.send(`Api is running on port ${ENV.PORT}`)
})


export default router