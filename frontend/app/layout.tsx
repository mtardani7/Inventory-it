import type { Metadata, Viewport } from "next";
import "./globals.css";

import Providers from "./providers";
import { AuthProvider } from "@/providers/auth-provider";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Inventory IT",
  description: "Inventory IT Management System",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inventory IT",
  },
  icons: [
    {
      rel: "icon",
      url: "/icon-192.svg",
    },
    {
      rel: "apple-touch-icon",
      url: "/icon-192.svg",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}