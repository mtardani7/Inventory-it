"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <WifiOff className="size-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Anda sedang offline</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Koneksi Anda terputus. Kunjungi halaman ini lagi saat jaringan tersedia.
        </p>
        <Button asChild className="mt-4" type="button">
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
