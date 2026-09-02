import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { setAuthCookie, clearAuthCookie } from "../utils/cookies";

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, token } = await authService.register(req.body);
    setAuthCookie(res, token);
    res.status(201).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, token } = await authService.login(req.body);
    setAuthCookie(res, token);
    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({ status: "success", data: { users } });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(200).json({ status: "success" });
};
