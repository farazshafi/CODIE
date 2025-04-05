import { generateAccessToken, verifyRefreshToken } from "../utils/jwtTokenUtil";

export const refreshToken = (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decode: any = verifyRefreshToken(token);
        if (!decode || !decode.email) return res.status(403).json({ message: "Invalid token" });

        const newAccessToken = generateAccessToken({ email: decode.email });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(402).json({ message: "Invalid token" });
    }
}
