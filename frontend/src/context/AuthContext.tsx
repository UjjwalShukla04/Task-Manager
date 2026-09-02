import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { User } from "../types";
import * as authApi from "../api/auth";
import { setUnauthorizedHandler } from "../api/axios";
import { connectSocket, disconnectSocket } from "../utils/socket";

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean;
  isAuthenticating: boolean;
  login: (data: authApi.LoginData) => Promise<void>;
  register: (data: authApi.RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ME_KEY = ["auth", "me"] as const;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = meQuery.data ?? null;

  // Keep the realtime socket in sync with auth state.
  useEffect(() => {
    if (user) connectSocket();
    else disconnectSocket();
  }, [user]);

  const resetToLoggedOut = useCallback(() => {
    queryClient.setQueryData(ME_KEY, null);
    queryClient.removeQueries({ queryKey: ["tasks"] });
    disconnectSocket();
  }, [queryClient]);

  // A 401 from any request (expired cookie) drops us to logged-out.
  useEffect(() => {
    setUnauthorizedHandler(resetToLoggedOut);
    return () => setUnauthorizedHandler(null);
  }, [resetToLoggedOut]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (u) => {
      queryClient.setQueryData(ME_KEY, u);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (u) => {
      queryClient.setQueryData(ME_KEY, u);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      resetToLoggedOut();
      queryClient.clear();
    },
  });

  const value: AuthContextValue = {
    user,
    isInitializing: meQuery.isLoading,
    isAuthenticating: loginMutation.isPending || registerMutation.isPending,
    login: async (data) => {
      await loginMutation.mutateAsync(data);
    },
    register: async (data) => {
      await registerMutation.mutateAsync(data);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
