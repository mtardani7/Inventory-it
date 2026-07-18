"use client";

import { useEffect, useState } from "react";
import { Download, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installable, setInstallable] = useState(false);
  const isOnline = useOnlineStatus();
  const isProduction = process.env.NODE_ENV === "production";
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");
  const swPath = `${basePath}/sw.js`;
  const swScope = `${basePath || ""}/`;

  useEffect(() => {
    if (!isProduction || typeof window === "undefined") {
      return;
    }

    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallable(true);
    };

    const registerServiceWorker = async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
      }

      try {
        const swResponse = await fetch(swPath, {
          method: "HEAD",
          cache: "no-store",
        });

        if (!swResponse.ok) {
          return;
        }

        const registration = await navigator.serviceWorker.register(swPath, {
          scope: swScope,
        });

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              installingWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch (error) {
        console.warn("Service worker registration failed", error);
      }
    };

    void registerServiceWorker();
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isProduction, swPath, swScope]);

  return (
    <>
      {!isOnline ? (
        <div className="fixed inset-x-3 top-3 z-[100] flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 shadow-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="size-4" />
            <span>Offline. Beberapa fitur tetap tersedia.</span>
          </div>
        </div>
      ) : null}

      {installable && installPrompt ? (
        <div className="fixed inset-x-3 bottom-3 z-[100] flex flex-col gap-2 rounded-xl border bg-background/95 p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <Download className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Pasang Inventory IT</p>
              <p className="text-xs text-muted-foreground">Akses cepat dari layar utama.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              await installPrompt.prompt();
              setInstallPrompt(null);
              setInstallable(false);
            }}
          >
            Pasang
          </Button>
        </div>
      ) : null}

      {children}
    </>
  );
}
