


import { HttpStatusCode } from "../utils/httpStatusCodes";
import { NextFunction, Request, Response } from "express"
import { LoginInput } from "../validation/userValidation"

import { generateAccessToken, generateRefreshToken } from "../utils/jwtTokenUtil"
import bcrypt from "bcryptjs"
import { IUserService } from "../services/interface/IUserService"
import { IProjectService } from "../services/interface/IProjectService"
import { IPaymentService } from "../services/interface/IPaymentService"
import { IUserSubscriptionService } from "../services/interface/IUserSubscriptionService"
import jwt from "jsonwebtoken"
import redis from "../config/redis"
import { ApiResponse } from "../utils/ApiResponse";
import { IRoomService } from "../services/interface/IRoomService";
import { IAdminService } from "../services/interface/IAdminService";
import { IDiscoverService } from '../services/interface/IDiscoverService';
import { ViewMode } from "../services/PaymentService";


export class AdminController {
    constructor(
        private readonly _userService: IUserService,
        private readonly _projectService: IProjectService,
        private readonly _paymentService: IPaymentService,
        private readonly _userSubscriptionService: IUserSubscriptionService,
        private readonly _roomService: IRoomService,
        private readonly _adminService: IAdminService,
        private readonly _discoverService: IDiscoverService
    ) { }

    loginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const credential: LoginInput = req.body

            const userExist = await this._userService.findUserByEmail(credential.email)

            if (!userExist) {
                const response = new ApiResponse(
                    HttpStatusCode.NOT_FOUND, null, "User not exists"
                )
                res.status(response.statusCode).json(response)
                return
            }

            if (!userExist.isAdmin) {
                const response = new ApiResponse(
                    HttpStatusCode.FORBIDDEN, null, "Access denied. Admins only."
                )
                res.status(response.statusCode).json(response)
                return
            }


            const isPasswordCorrect = await bcrypt.compare(credential.password, userExist.password)

            if (!isPasswordCorrect) {
                const response = new ApiResponse(
                    HttpStatusCode.BAD_REQUEST, null, "Invalid password or email."
                )
                res.status(response.statusCode).json(response)
                return
            }

            const payload = { id: userExist._id, email: userExist.email, isAdmin: userExist.isAdmin }

            const accessToken = generateAccessToken(payload)
            const refreshToken = generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE), // 7 days
            })

            const response = new ApiResponse(
                HttpStatusCode.OK,
                {
                    name: userExist.name,
                    email: userExist.email,
                    avatar: userExist.avatarUrl,
                    id: userExist._id,
                    isAdmin: userExist.isAdmin,
                    accessToken
                }
                , "Login success"
            )
            res.status(response.statusCode).json(response)

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
                const response = new ApiResponse(
                    HttpStatusCode.BAD_REQUEST, null, "Invalid Token."
                )
                res.status(response.statusCode).json(response)
                return
            }

            const expiresAt = decoded.exp
            const ttl = expiresAt - Math.floor(Date.now() / 1000);
            console.log("checking ttl: is grater than 0", ttl)
            if (ttl > 0) {
                await redis.setex(`blacklist:${token}`, ttl, "true")
            }

            res.json({ message: "Logged out successfully" });
        } catch (err) {
            next(err)
        }
    }

    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page = 1, limit = 10, search = '', status = "all" } = req.query;

            // Convert to proper types
            const pageNumber = parseInt(page as string);
            const pageSize = parseInt(limit as string);
            const searchQuery = search.toString();

            const filter: {
                isAdmin: boolean;
                $or?: { [key: string]: { $regex: string; $options: string } }[];
                isBlocked?: boolean;
            } = {
                isAdmin: false,
            };

            if (searchQuery) {
                filter.$or = [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } }
                ];
            }

            if (status === 'active') {
                filter.isBlocked = false;
            } else if (status === 'suspended') {
                filter.isBlocked = true;
            }

            // Fetch users with pagination
            const users = await this._userService.findUsersWithPagination(filter, pageNumber, pageSize);

            const totalUsers = await this._userService.countUsers(filter);

            const response = new ApiResponse(
                HttpStatusCode.OK, {
                pagination: {
                    total: totalUsers,
                    page: pageNumber,
                    limit: pageSize,
                    totalPages: Math.ceil(totalUsers / pageSize)
                },
                user: users.map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isBlocked: user.isBlocked,
                    avatarUrl: user.avatarUrl,
                    bio: user.bio
                })),
            }, "User fetched successfully"
            )
            res.status(response.statusCode).json(response)

        } catch (err) {
            next(err)
        }
    }

    updateBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, status } = req.body

            const user = this._userService.findUserById(userId)
            if (!user) {
                const response = new ApiResponse(
                    HttpStatusCode.NOT_FOUND, null, "User Not found."
                )
                res.status(response.statusCode).json(response)
                return
            }

            if (status === "suspend") {
                await this._userService.blockUserById(userId)
                const response = new ApiResponse(
                    HttpStatusCode.OK, null, "User blocked successfully."
                )
                res.status(response.statusCode).json(response)
                return
            } else if (status === "active") {
                await this._userService.unblockUserById(userId)
                const response = new ApiResponse(
                    HttpStatusCode.OK, null, "User unBlocked successfully."
                )
                res.status(response.statusCode).json(response)
                return
            }
        } catch (error) {
            next(error)
        }
    }

    getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = await this._userService.adminDashboardUserData()
            const projectData = await this._projectService.adminDashboardProjectData()
            const paymentData = await this._paymentService.adminDashboardPaymenttData()
            const discoverData = await this._discoverService.adminDashboardDiscoverData()
            const response = new ApiResponse(
                HttpStatusCode.OK, { userData, projectData, paymentData, discoverData }, "Dashboard data fetched successfully."
            )
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    getPaymentData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sort = (req.query.sort as string) || "all";
            const { payments, totalPages } = await this._paymentService.getPaymentDataAdmin(page, limit, sort)
            const response = new ApiResponse(
                HttpStatusCode.OK, { payments, totalPages }, "Payment fetched successfully."
            )
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, status } = req.body
            const paymentData = await this._paymentService.updatePaymentStatus(id, status)
            const response = new ApiResponse(
                HttpStatusCode.OK, paymentData, "Payment Updated successfully."
            )
            res.status(response.statusCode).json(response)
        } catch (error) {
            next(error)
        }
    }

    getAdminGraph = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this._userService.getAdminGraphData();
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found Admin Graph data")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getSubscriptionHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year, month, sort, currentPage, limit, search } = req.query
            const data = await this._userSubscriptionService.getSubscriptionHistory(Number(year), Number(month), String(sort), Number(currentPage), Number(limit), String(search))
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found Subscription History")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getRevenueByYear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year } = req.query
            const data = await this._paymentService.getRevenueByYear(Number(year))
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found Payment Revenue")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getUsersGraphByYear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year } = req.query
            const data = await this._userService.getUsersGraphByYear(Number(year))
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found users Graph data")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getProjectsGraphByYear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year } = req.query
            const data = await this._projectService.getUsersGraphByYear(Number(year))
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found Projects graph data")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getDiscoveriesGraphByYear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year } = req.query
            const data = await this._discoverService.getDiscoverGraphByYear(Number(year))
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found Disoveries graph data")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getRoomGraphByYear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year } = req.query
            const data = await this._roomService.getRoomsByYear(Number(year))
            const response = new ApiResponse(HttpStatusCode.OK, data, "Found Projects graph data")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year } = req.query
            const data = await this._adminService.getDashboardOverview(Number(year))

            const response = new ApiResponse(HttpStatusCode.OK, data, "Found Dashbaord overview data")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getAllPublishedSnippets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this._adminService.getTotalPublishedSnippets()

            const response = new ApiResponse(HttpStatusCode.OK, { totalPublishedSnippets: data.length }, "Found All published snippets data")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getYearlySalesReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this._adminService.getYearlySalesReport()

            const response = new ApiResponse(HttpStatusCode.OK, data, "Found All Yearly sales report")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getMonthlySalesReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year } = req.query
            const data = await this._adminService.getMonthlySalesReport(Number(year))

            const response = new ApiResponse(HttpStatusCode.OK, data, "Found All monthly sales report")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getDailySalesReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { year, month } = req.query
            const data = await this._adminService.getDailySalesReport(Number(year), Number(month))

            const response = new ApiResponse(HttpStatusCode.OK, data, "Found All Daily sales report")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    getSalesReportByDate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { date } = req.query
            const data = await this._adminService.getSalesReportByDate(String(date))

            const response = new ApiResponse(HttpStatusCode.OK, data, "Found All sales report")
            res.status(response.statusCode).json(response);
        } catch (error) {
            next(error)
        }
    }

    downloadSalesReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const view = (req.query.view as string) || "monthly";
            const year = req.query.year ? Number(req.query.year) : undefined;
            const month = req.query.month !== undefined ? Number(req.query.month) : undefined;
            const date = req.query.date as string | undefined;

            if (view === "monthly" && !year) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "year query param is required for monthly view")
                res.status(response.statusCode).json(response);
                return
            }
            if (view === "daily" && (year === undefined || month === undefined)) {
                const response = new ApiResponse(HttpStatusCode.BAD_REQUEST, null, "year and month query params are required for daily view")
                res.status(response.statusCode).json(response);
                return
            }

            const { csv, filename } = await this._adminService.generateSalesReportCsv(view as ViewMode, { year, month, date });

            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.status(200).send(csv);
            return
        } catch (err) {
            next(err)
        }
    }


}
