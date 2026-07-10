"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const isAuthRoute = pathname === "/login";

    if (!isAuthenticated && !isAuthRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
