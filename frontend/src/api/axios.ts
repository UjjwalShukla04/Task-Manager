import axios from "axios";

/** REST base, e.g. http://localhost:5000/api */
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/** Socket.io connects to the origin, not the /api path. */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/** Callbacks the auth layer registers so a 401 can reset app state. */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;
export const setUnauthorizedHandler = (fn: UnauthorizedHandler | null) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    // Ignore the probe request the auth bootstrap makes.
    const isAuthProbe = url.includes("/auth/me");
    if (status === 401 && !isAuthProbe) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;
