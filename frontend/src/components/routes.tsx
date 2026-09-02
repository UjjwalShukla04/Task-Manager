import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FullPageSpinner } from "./ui/Spinner";

/** Gate for authenticated areas. */
export function RequireAuth() {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <FullPageSpinner label="Loading your workspace…" />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Keeps logged-in users away from /login and /register. */
export function RedirectIfAuthed() {
  const { user, isInitializing } = useAuth();
  if (isInitializing) return <FullPageSpinner />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
