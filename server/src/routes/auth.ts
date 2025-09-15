import { Request, Response } from "express";
import { generateAccessToken, verifyRefreshToken } from "../utils/jwtTokenUtil";
import { HttpStatusCode } from "../utils/httpStatusCodes";

export const refreshToken = (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "No token provided" });

        const decode = verifyRefreshToken(token);
        if (!decode || !decode.email) return res.status(HttpStatusCode.FORBIDDEN).json({ message: "Invalid token" });

        const newAccessToken = generateAccessToken({ email: decode.email });

        res.status(HttpStatusCode.OK).json({ accessToken: newAccessToken });
    } catch {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid token" });
    }
}
