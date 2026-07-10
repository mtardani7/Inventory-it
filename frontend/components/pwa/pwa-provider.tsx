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

  useEffect(() => {
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
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.warn("Service worker registration failed", error);
      }
    };

    void registerServiceWorker();
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

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
          <Button size="sm" onClick={() => installPrompt.prompt()}>
            Pasang
          </Button>
        </div>
      ) : null}

      {children}
    </>
  );
}
