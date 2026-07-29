"use client";

import Link from "next/link";
import { LayoutGrid, Package, Trash2, BarChart3, Settings, History } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/asset-history", label: "Asset History", icon: History },
  { href: "/disposal", label: "Disposal", icon: Trash2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background p-4">
      <div className="px-2 py-2 flex items-center justify-center">
        <img src="./icons/icon-192x192.png" alt="Inventory IT Logo" className="h-12 w-12 rounded-full" />
      </div>

      <nav className="mt-6 space-y-1">
        {items.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}