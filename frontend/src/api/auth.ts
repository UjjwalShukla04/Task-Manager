import api from "./axios";
import type { AuthResponse, ApiResponse } from "../types";

// Note: We are importing types from backend directly to ensure type safety.
// If this is a monorepo, this works. If not, we should duplicate the types or use a shared package.
// For this environment, I'll redefine them here to avoid path issues if the backend folder isn't accessible cleanly.

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/register",
    data
  );
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    data
  );
  return response.data;
};

export const logout = async () => {
  await api.post("/auth/logout");
};

export const getMe = async () => {
  const response = await api.get<{ data: { user: AuthResponse["user"] } }>(
    "/auth/me"
  );
  return response.data.data.user;
};

export const getAllUsers = async () => {
  const response = await api.get<{ data: { users: AuthResponse["user"][] } }>(
    "/auth/users"
  );
  return response.data.data.users;
};
