import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}