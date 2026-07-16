"use client";

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import authService from "@/services/auth.service";
import { useMe } from "@/hooks/use-auth";

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data, isLoading, refetch } = useMe();

  const value = useMemo(
    () => ({
      user: data ?? null,
      isAuthenticated: !!data && authService.isAuthenticated(),
      isLoading,
      refetch,
    }),
    [data, isLoading, refetch]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used within AuthProvider"
    );
  }

  return context;
}