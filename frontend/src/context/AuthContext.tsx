import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../types";
import * as authApi from "../api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../utils/socket";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: authApi.LoginData) => Promise<void>;
  register: (data: authApi.RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        connectSocket(userData.id);
      } catch (error) {
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  const connectSocket = (userId: string) => {
    const socket = getSocket();
    socket.connect();
    socket.emit("join_dashboard", userId);
  };

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.data.user);
      connectSocket(data.data.user.id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.data.user);
      connectSocket(data.data.user.id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      const socket = getSocket();
      socket.disconnect();
      queryClient.clear();
    },
  });

  const login = async (data: authApi.LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: authApi.RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: loginMutation.isPending || registerMutation.isPending,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
