"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<AuthUser>) => void;
}

const STORAGE_KEY = "inventory-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const fromLocal = window.localStorage.getItem(STORAGE_KEY);
    if (fromLocal) {
      return JSON.parse(fromLocal) as AuthUser;
    }

    const fromSession = window.sessionStorage.getItem(STORAGE_KEY);
    if (fromSession) {
      return JSON.parse(fromSession) as AuthUser;
    }
  } catch {
    // ignore
  }

  return null;
}

function setAuthCookie(value: string, rememberMe: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setHydrated(true);
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const fallbackUser: AuthUser = {
      id: 1,
      name: email.split("@")[0] || "User",
      email,
    };

    const nextUser = {
      ...fallbackUser,
      name: password ? fallbackUser.name : fallbackUser.name,
    };

    const serialized = JSON.stringify(nextUser);

    if (rememberMe) {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    }

    window.sessionStorage.setItem(STORAGE_KEY, serialized);
    setAuthCookie(serialized, rememberMe);
    setUser(nextUser);
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    clearAuthCookie();
    setUser(null);
  };

  const updateProfile = (profile: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) {
        return current;
      }
      const nextUser = { ...current, ...profile };
      const serialized = JSON.stringify(nextUser);
      window.localStorage.setItem(STORAGE_KEY, serialized);
      window.sessionStorage.setItem(STORAGE_KEY, serialized);
      setAuthCookie(serialized, true);
      return nextUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      hydrated,
      isAuthenticated: !!user,
      login,
      logout,
      updateProfile,
    }),
    [hydrated, user]
  );

  if (!hydrated) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
