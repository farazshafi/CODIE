import { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
});
