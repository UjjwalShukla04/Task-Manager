import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { AUTH_COOKIE } from "../utils/cookies";

export interface AuthRequest extends Request {
  user?: { id: string };
}

export interface JwtPayload {
  id: string;
}

/** Verify a JWT and return its payload, or throw. Shared by HTTP + socket auth. */
export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null || !("id" in decoded)) {
    throw new Error("Malformed token payload");
  }
  return { id: String((decoded as Record<string, unknown>).id) };
};

export const extractToken = (req: Request): string | undefined => {
  if (req.cookies?.[AUTH_COOKIE]) return req.cookies[AUTH_COOKIE];
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return undefined;
};

export const protect = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return next(new AppError("Not authorized, please login", 401));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return next(new AppError("Not authorized, token failed", 401));
  }
};
