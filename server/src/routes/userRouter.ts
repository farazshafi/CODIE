import { Router } from "express"
import { createUser, googleLoginAuth, googleRegisterAuth, loginUser, resendOtp, verifyOtp } from "../controllers/userController"
import { ENV } from "../config/env"

const router = Router()

router.post("/register", createUser)
router.post("/login", loginUser)
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/google-auth-register", googleRegisterAuth);
router.post("/google-auth-login", googleLoginAuth);


router.get("/", (req, res) => {
    res.send(`Api is running on port ${ENV.PORT}`)
})
// router.get("/auth/refresh-token",refreshToken)


export default router