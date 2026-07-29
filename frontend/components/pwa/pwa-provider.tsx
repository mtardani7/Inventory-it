"use client";

import { useEffect, useState } from "react";
import { Download, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface SerwistWindow extends Window {
  serwist?: {
    register: () => Promise<ServiceWorkerRegistration> | ServiceWorkerRegistration;
  };
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installable, setInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const isOnline = useOnlineStatus();
  const isProduction = process.env.NODE_ENV === "production";
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");
  const swPath = `${basePath}/sw.js`;
  const swScope = `${basePath || ""}/`;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));

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
        let registration: ServiceWorkerRegistration;
        const serwistRegister = (window as SerwistWindow).serwist?.register;

        if (typeof serwistRegister === "function") {
          registration = await serwistRegister();
        } else {
          registration = await navigator.serviceWorker.register(swPath, {
            scope: swScope,
          });
        }

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

    const onInstalled = () => {
      setInstallPrompt(null);
      setInstallable(false);
      setIsStandalone(true);
    };

    void registerServiceWorker();
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isProduction, swPath, swScope]);

  const canShowInstallCta = isProduction && !isStandalone;

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

      {canShowInstallCta ? (
        <>
          <div className="fixed bottom-4 right-3 z-[110] sm:right-4">
            <Button
              type="button"
              size="sm"
              className="h-11 rounded-full px-4 shadow-lg"
              onClick={async () => {
                if (!installable || !installPrompt) {
                  toast.info(
                    isIos
                      ? "Safari iOS: ketuk Share lalu pilih Add to Home Screen."
                      : "Browser belum menampilkan prompt install. Buka menu browser lalu pilih Install app / Add to Home Screen.",
                  );
                  return;
                }

                await installPrompt.prompt();
                const choice = await installPrompt.userChoice;
                if (choice.outcome === "accepted") {
                  setInstallPrompt(null);
                  setInstallable(false);
                }
              }}
            >
              <Download className="mr-2 size-4" />
              Install App
            </Button>
          </div>
        </>
      ) : null}

      {children}
    </>
  );
}
