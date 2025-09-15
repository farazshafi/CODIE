import { NextFunction, Request, Response } from "express"
import { GoogleAuthInput, LoginInput, UserInput } from "../validation/userValidation"
import redis from "../config/redis"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { IUserService } from "../services/interface/IUserService"
import { IOtpService } from "../services/interface/IOtpServices"
import crypto from "crypto"
import { IMailService } from "../services/interface/IMailService"
import jwt from "jsonwebtoken"
import { HttpStatusCode } from "../utils/httpStatusCodes"

export class UserController {
    constructor(
        private readonly userService: IUserService,
        private readonly otpService: IOtpService,
        private readonly mailService: IMailService,
    ) { }

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedUser: UserInput = req.body
            const userExist = await this.userService.findUserByEmail(validatedUser.email)

            if (userExist) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "User already exists" })
                return
            }

            await this.otpService.generateAndSendOtp(validatedUser.email)

            const redisKey = `pendingUser:${validatedUser.email}`
            await redis.set(redisKey, JSON.stringify(validatedUser), 'EX', 300)

            res.status(HttpStatusCode.OK).json({
                message: "OTP sent to email. Please verify to complete registration."
            })

        } catch (error) {
            next(error)
        }
    }

    verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, otp } = req.body

            await this.otpService.verifyOtp(email, otp)

            const redisKey = `pendingUser:${email}`
            const userDataStr = await redis.get(redisKey)

            if (!userDataStr) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "No pending registration found or expired." })
                return
            }

            const userData: UserInput = JSON.parse(userDataStr)

            const newUser = await this.userService.createUser(userData)

            await redis.del(redisKey)

            const payload = { id: newUser._id, email: newUser.email, isAdmin: newUser.isAdmin }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })

            res.status(HttpStatusCode.CREATED).json({
                message: "User registered successfully",
                data: {
                    name: newUser.name,
                    email: newUser.email,
                    id: newUser._id,
                    isAdmin: newUser.isAdmin
                },
                accessToken
            })
        } catch (error) {
            next(error)
        }
    }

    resendOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body

            const redisKey = `pendingUser:${email}`
            const userDataStr = await redis.get(redisKey)

            if (!userDataStr) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "No pending registration found or expired." })
                return
            }

            await this.otpService.generateAndSendOtp(email)

            res.status(HttpStatusCode.OK).json({
                message: "OTP resent to email. Please verify to complete registration."
            })
        } catch (error) {
            next(error)
        }
    }

    resetLink = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body

            const user = await this.userService.findUserByEmail(email)
            if (!user) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "User Not Found!" })
                return
            }
            if (user.googleId) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Password reset is not available for Google accounts." })
                return
            }

            const resetToken = crypto.randomBytes(32).toString("hex")

            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
            await this.userService.savePasswordResetToken(email, hashedToken, new Date(Date.now() + 3600000)); // 1h

            const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`

            await this.mailService.sendResetLink(email, resetLink)


            res.status(HttpStatusCode.OK).json({
                message: "Password reset link sent to your email."
            });
        } catch (error) {
            next(error)
        }
    }

    loginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const credential: LoginInput = req.body

            const userExist = await this.userService.findUserByEmail(credential.email)

            if (!userExist) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "User not exists" })
                return
            }

            if (userExist.isBlocked) {
                res.status(HttpStatusCode.OK).json({ message: "User Blocked", isBlocked: true })
                return
            }

            if (userExist && userExist?.googleId && userExist?.googleId.length > 1) {
                res.status(HttpStatusCode.CONFLICT).json({ message: "This account is accociated with Google , Please try to Login with google instead." });
                return
            }

            const isPasswordCorrect = await bcrypt.compare(credential.password, userExist.password)

            if (!isPasswordCorrect) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "Invalid password or email" })
                return
            }

            const payload = { id: userExist._id, email: userExist.email, isAdmin: userExist.isAdmin }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })

            res.status(HttpStatusCode.OK).json({
                message: "Login Success",
                data: {
                    name: userExist.name,
                    email: userExist.email,
                    avatar: userExist.avatarUrl,
                    id: userExist._id,
                    isAdmin: userExist.isAdmin,
                    github: userExist.github,
                    portfolio: userExist.portfolio,
                },
                accessToken
            })

        } catch (err) {
            next(err)
        }
    }

    logoutUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1]

            const decoded = jwt.decode(token)
            console.log("decoded token data", decoded)

            if (!decoded || !decoded.exp) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid token" });
                return
            }

            const expiresAt = decoded.exp
            const ttl = expiresAt - Math.floor(Date.now() / 1000);
            console.log("checking ttl: is grater than 0",ttl)
            if (ttl > 0) {
                await redis.setex(`blacklist:${token}`, ttl, "true")
            }

            res.json({ message: "Logged out successfully" });
        } catch (err) {
            next(err)
        }
    }

    googleRegisterAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedUser: GoogleAuthInput = req.body
            let user = await this.userService.findUserByEmail(validatedUser.email)

            if (user && !user.googleId) {
                res.status(HttpStatusCode.CONFLICT).json({ message: "An account with this email already exists" })
                return
            }

            if (!user) {
                const newUserPayload = {
                    name: validatedUser.name,
                    email: validatedUser.email,
                    googleId: validatedUser.googleId,
                    avatarUrl: validatedUser.avatarUrl ?? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcDdrIJuxsoeWIjwPqSfcL9PFqVdc5-F6Urm4CjOcfCMPH752K-36Xj0tjyazZqKWWk8g",
                    isAdmin: validatedUser.isAdmin ?? false,
                    isBlocked: validatedUser.isBlocked ?? false
                };
                user = await this.userService.createUser(newUserPayload);
            }


            const payload = { id: user!._id, email: user!.email, isAdmin: user!.isAdmin }
            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            res.status(HttpStatusCode.OK).json({
                message: "Google Auth Success",
                data: {
                    name: user!.name,
                    email: user!.email,
                    avatar: user!.avatarUrl,
                    id: user!._id,
                    isAdmin: user!.isAdmin
                },
                accessToken
            })

        } catch (err) {
            next(err)
        }
    }

    googleLoginAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body

            if (!email) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Email is required" })
                return
            }

            const user = await this.userService.findUserByEmail(email)

            if (!user) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "User not exists" })
                return
            }

            if (user.isBlocked) {
                res.status(HttpStatusCode.OK).json({ message: "User is blocked!, Can't access", isBlocked: true })
                return
            }


            if (user && !user.googleId) {
                res.status(HttpStatusCode.CONFLICT).json({ message: "An account with this email already exists" })
                return
            }

            const payload = { id: user._id, email: user.email, isAdmin: user.isAdmin }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            res.status(HttpStatusCode.OK).json({
                message: "Google Auth Success",
                data: {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatarUrl,
                    id: user._id,
                    isAdmin: user.isAdmin,
                    github: user.github,
                    portfolio: user.portfolio,
                },
                accessToken
            })

        } catch (err) {
            next(err)
        }
    }

    refreshAccessToken = async (req: Request, res: Response) => {
        try {
            const token = req.cookies.refreshToken

            if (!token) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "Refresh token missing" });
                return
            }

            const decoded = verifyRefreshToken(token);
            const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

            res.status(HttpStatusCode.OK).json({ accessToken });
            return
        } catch (err) {
            console.log("error", err)
            res.status(HttpStatusCode.FORBIDDEN).json({ message: "Invalid refresh token" });
        }
    }

    setNewPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, token } = req.body

            const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

            const resetEntry = await this.userService.findResetToken(hashedToken, email)

            if (!resetEntry || Number(resetEntry.expireAt) < Date.now()) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid or expired token." });
                return
            }

            await this.userService.updateUserPassword(email, password)

            await this.userService.deleteResetToken(email)

            res.status(HttpStatusCode.OK).json({ message: "Password has been reset successfully." });
        } catch (err) {
            next(err)
        }
    }

    searchUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, userId } = req.body

            const allUsers = await this.userService.searchAllUsers(email, userId)
            const userEmails = allUsers.map(user => ({ email: user.email, name: user.name, id: user._id }));
            res.status(HttpStatusCode.OK).json(userEmails);

        } catch (err) {
            next(err)
        }
    }

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const userData = req.body
            console.log("user data", userData)
            const updatedUser = await this.userService.updateUser(userId, userData)
            const response = {
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatarUrl,
                id: updatedUser._id,
                isAdmin: updatedUser.isAdmin,
                github: updatedUser.github,
                portfolio: updatedUser.portfolio,
            }
            res.status(HttpStatusCode.OK).json({ message: "user updated successfuly", response })
        } catch (err) {
            next(err)
        }
    }

    getUserData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id
            const updatedUser = await this.userService.getUserData(userId)

            const data = {
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatarUrl,
                id: updatedUser._id,
                isAdmin: updatedUser.isAdmin,
                github: updatedUser.github,
                portfolio: updatedUser.portfolio,
            }

            res.status(HttpStatusCode.OK).json(data)
        } catch (err) {
            next(err)
        }
    }

}