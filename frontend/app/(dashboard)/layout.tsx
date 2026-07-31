"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const shouldShowSidebar = !sidebarCollapsed;

  const headerProps = useMemo(
    () => ({
      sidebarCollapsed,
      onToggleSidebar: () => setSidebarCollapsed((value) => !value),
    }),
    [sidebarCollapsed]
  );

  return (
    <SidebarProvider className="min-w-0">
      {shouldShowSidebar ? (
        <div className="hidden shrink-0 md:block">
          <AppSidebar />
        </div>
      ) : null}
      <SidebarInset className="min-w-0">
        <AppHeader {...headerProps} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}