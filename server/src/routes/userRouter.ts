import { Router } from "express"
import { createUser, googleLoginAuth, googleRegisterAuth, loginUser, refreshAccessToken, resendOtp, verifyOtp } from "../controllers/userController"
import { ENV } from "../config/env"
import { validate } from "../middlewares/validate"
import { googleAuthSchema, loginSchema, userSchema } from "../validation/userValidation"

const router = Router()

router.post("/register", validate(userSchema), createUser)
router.post("/login", validate(loginSchema), loginUser)
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/google-auth-register", validate(googleAuthSchema), googleRegisterAuth);
router.post("/google-auth-login", googleLoginAuth);
router.post("/auth/refresh-token", refreshAccessToken)


router.get("/", (req, res) => {
    res.send(`Api is running on port ${ENV.PORT}`)
})


export default router