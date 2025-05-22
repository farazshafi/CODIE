

import { NextFunction, Request, Response } from "express"
import { LoginInput } from "../validation/userValidation"

import { generateAccessToken, generateRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { IUserService } from "../services/interface/IUserService"


export class AdminController {
    constructor(
        private readonly userService: IUserService,
    ) { }

    loginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const credential: LoginInput = req.body

            const userExist = await this.userService.findUserByEmail(credential.email)

            if (!userExist) {
                res.status(401).json({ message: "User not exists" })
                return
            }

            if (!userExist.isAdmin) {
                res.status(403).json({ message: 'Access denied. Admins only.' });
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