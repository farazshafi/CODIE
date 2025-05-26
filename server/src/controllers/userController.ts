import { NextFunction, Request, Response } from "express"
import { GoogleAuthInput, LoginInput, UserInput } from "../validation/userValidation"
import { userService } from "../container"
import redis from "../config/redis"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { IUser } from "../models/userModel"
import { IUserService } from "../services/interface/IUserService"
import { IOtpService } from "../services/interface/IOtpServices"
import crypto from "crypto"
import { IMailService } from "../services/interface/IMailService"

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
                res.status(400).json({ message: "User already exists" })
                return
            }

            await this.otpService.generateAndSendOtp(validatedUser.email)

            const redisKey = `pendingUser:${validatedUser.email}`
            await redis.set(redisKey, JSON.stringify(validatedUser), 'EX', 300)

            res.status(200).json({
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
                res.status(400).json({ message: "No pending registration found or expired." })
                return
            }

            const userData: UserInput = JSON.parse(userDataStr)

            const newUser = await this.userService.createUser(userData)

            await redis.del(redisKey)

            const payload = { id: newUser._id, email: newUser.email }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })

            res.status(201).json({
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
                res.status(400).json({ message: "No pending registration found or expired." })
                return
            }

            await this.otpService.generateAndSendOtp(email)

            res.status(200).json({
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
                res.status(404).json({ message: "User Not Found!" })
                return
            }
            if (user.googleId) {
                res.status(400).json({ message: "Password reset is not available for Google accounts." })
                return
            }

            const resetToken = crypto.randomBytes(32).toString("hex")

            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
            await this.userService.savePasswordResetToken(email, hashedToken, new Date(Date.now() + 3600000)); // 1h

            const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`

            await this.mailService.sendResetLink(email, resetLink)


            res.status(200).json({
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
                res.status(401).json({ message: "User not exists" })
                return
            }

            if (userExist.isBlocked) {
                res.status(200).json({ message: "User Blocked", isBlocked: true })
                return
            }

            if (userExist && userExist?.googleId && userExist?.googleId.length > 1) {
                res.status(409).json({ message: "This account is accociated with Google , Please try to Login with google instead." });
                return
            }

            const isPasswordCorrect = await bcrypt.compare(credential.password, userExist.password)

            if (!isPasswordCorrect) {
                res.status(401).json({ message: "Invalid password or email" })
                return
            }

            const payload = { id: userExist._id, email: userExist.email }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })

            res.status(200).json({
                message: "Login Success",
                data: {
                    name: userExist.name,
                    email: userExist.email,
                    avatar: userExist.avatarUrl,
                    id: userExist._id,
                    isAdmin: userExist.isAdmin
                },
                accessToken
            })

        } catch (err) {
            next(err)
        }
    }

    googleRegisterAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedUser: GoogleAuthInput = req.body
            const user = await this.userService.findUserByEmail(validatedUser.email)

            if (user && !user.googleId) {
                res.status(409).json({ message: "An account with this email already exists" })
                return
            }

            let myUser: IUser;

            if (!user) {
                const newUser = await this.userService.createUser({
                    name: validatedUser.name,
                    email: validatedUser.email,
                    googleId: validatedUser.googleId,
                    avatarUrl: validatedUser.avatarUrl ?? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcDdrIJuxsoeWIjwPqSfcL9PFqVdc5-F6Urm4CjOcfCMPH752K-36Xj0tjyazZqKWWk8g",
                    isAdmin: validatedUser.isAdmin ?? false,
                    isBlocked: validatedUser.isBlocked ?? false
                });

                myUser = newUser;
            }


            const payload = { id: myUser._id, email: myUser.email }
            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            res.status(200).json({
                message: "Google Auth Success",
                data: {
                    name: myUser.name,
                    email: myUser.email,
                    avatar: myUser.avatarUrl,
                    id: myUser._id,
                    isAdmin: myUser.isAdmin
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
                res.status(400).json({ message: "Email is required" })
                return
            }

            const user = await this.userService.findUserByEmail(email)

            if (!user) {
                res.status(404).json({ message: "User not exists" })
                return
            }

            if (user.isBlocked) {
                res.status(200).json({ message: "User is blocked!, Can't access", isBlocked: true })
                return
            }


            if (user && !user.googleId) {
                res.status(409).json({ message: "An account with this email already exists" })
                return
            }

            const payload = { id: user._id, email: user.email }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            res.status(200).json({
                message: "Google Auth Success",
                data: {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatarUrl,
                    id: user._id,
                    isAdmin: user.isAdmin
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
                res.status(401).json({ message: "Refresh token missing" });
                return
            }

            const decoded = verifyRefreshToken(token);
            const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

            res.status(200).json({ accessToken });
            return
        } catch (err) {
            console.log("error", err)
            res.status(403).json({ message: "Invalid refresh token" });
        }
    }

    setNewPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, token } = req.body

            const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

            const resetEntry = await this.userService.findResetToken(hashedToken, email)

            if (!resetEntry || Number(resetEntry.expireAt) < Date.now()) {
                res.status(400).json({ message: "Invalid or expired token." });
                return
            }

            await this.userService.updateUserPassword(email, password)

            await this.userService.deleteResetToken(email)

            res.status(200).json({ message: "Password has been reset successfully." });
        } catch (err) {
            next(err)
        }
    }

    searchUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, userId } = req.body

            const allUsers = await this.userService.searchAllUsers(email, userId)
            const userEmails = allUsers.map(user => ({ email: user.email, name: user.name, id: user._id }));
            res.status(200).json(userEmails);

        } catch (err) {
            next(err)
        }
    }

}