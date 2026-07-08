"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="flex h-16 items-center border-b px-4">
      <SidebarTrigger />

      <h1 className="ml-4 text-lg font-semibold">
        Inventory IT
      </h1>
    </header>
  );
}