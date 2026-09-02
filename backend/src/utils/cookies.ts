import { CookieOptions, Response } from "express";
import { env } from "../config/env";

export const AUTH_COOKIE = "token";

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  path: "/",
};

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE, token, { ...baseOptions, maxAge: MAX_AGE_MS });
};

export const clearAuthCookie = (res: Response) => {
  // Options (except maxAge/expires) must match those used when setting,
  // otherwise the browser will not remove the cookie.
  res.clearCookie(AUTH_COOKIE, baseOptions);
};
