import api from "./axios";
import type { User } from "../types";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<User> => {
  const res = await api.post<{ data: { user: User } }>("/auth/register", data);
  return res.data.data.user;
};

export const login = async (data: LoginData): Promise<User> => {
  const res = await api.post<{ data: { user: User } }>("/auth/login", data);
  return res.data.data.user;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const getMe = async (): Promise<User> => {
  const res = await api.get<{ data: { user: User } }>("/auth/me");
  return res.data.data.user;
};

export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get<{ data: { users: User[] } }>("/auth/users");
  return res.data.data.users;
};
