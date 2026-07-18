import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

import Providers from "./providers";
import { AuthProvider } from "@/providers/auth-provider";
import { AuthGuard } from "@/components/auth/auth-guard";

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = rawBasePath ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}` : "";
const withBasePath = (path: string) => `${basePath}${path}`;

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  applicationName: "Inventory IT",
  title: "Inventory IT",
  description: "Inventory IT Management System",
  manifest: withBasePath("/manifest.webmanifest"),
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inventory IT",
    startupImage: [
      {
        url: withBasePath("/screenshots/dashboard-wide.png"),
        media: "(device-width: 1024px)",
      },
      {
        url: withBasePath("/screenshots/dashboard-narrow.png"),
        media: "(device-width: 390px)",
      },
    ],
  },
  icons: {
    icon: [
      {
        url: withBasePath("/icons/icon-192x192.png"),
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: withBasePath("/icons/icon-512x512.png"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: withBasePath("/icons/icon-192x192.png"),
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: [withBasePath("/icons/icon-192x192.png")],
  },
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
    <html lang="id" suppressHydrationWarning className={`${manrope.variable} ${jetbrainsMono.variable}`}>
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