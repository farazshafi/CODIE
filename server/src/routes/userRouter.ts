import { Router } from "express"
import { ENV } from "../config/env"
import { validate } from "../middlewares/validate"
import { emailSchema, googleAuthSchema, loginSchema, setNewPasswordSchema, updateUser, userSchema } from "../validation/userValidation"
import { userController } from "../container"
import { authenticate } from "../middlewares/authenticate"
import { protect } from "../middlewares/protectMiddleware"

const router = Router()

router.post("/register", validate(userSchema), userController.createUser)
router.post("/login", validate(loginSchema), userController.loginUser)
router.get("/logout", authenticate, protect, userController.logoutUser)
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", validate(emailSchema), userController.resendOtp);
router.post("/reset-link", validate(emailSchema), userController.resetLink);
router.post("/set-new-password", validate(setNewPasswordSchema), userController.setNewPassword);
router.post("/google-auth-register", validate(googleAuthSchema), userController.googleRegisterAuth);
router.post("/google-auth-login", userController.googleLoginAuth);
router.post("/auth/refresh-token", userController.refreshAccessToken)
router.post("/search-users", userController.searchUsers)
router.put("/update_user", authenticate, protect, validate(updateUser), userController.updateUser);
router.get("/get_user", authenticate, protect, userController.getUserData);
router.get("/get_contributer/:id", authenticate, protect, userController.getContributerDetails);
router.put("/update_profile_visibility/", authenticate, protect, userController.updateProfileVisiblility);
router.get("/get_profile_visibility/:id", authenticate, protect, userController.getProfileVisibility);

router.get("/", (req, res) => {
    res.send(`Api is running on port ${ENV.PORT}`)
})


export default router