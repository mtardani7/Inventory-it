"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth";
import { PwaProvider } from "@/components/pwa/pwa-provider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PwaProvider>
            {children}
            <Toaster richColors position="top-right" />
          </PwaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}