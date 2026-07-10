"use client";

import Link from "next/link";
import { Menu, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/lib/auth";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b px-3 sm:px-4">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                />
              }
            >
              <Menu />
            </SheetTrigger>
          <SheetContent side="left" className="w-[84vw] max-w-sm p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <AppSidebar />
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="ml-1 text-base font-semibold sm:text-lg">Inventory IT</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild size="sm" type="button" variant="outline" className="h-8 px-2 sm:px-3">
          <Link href="/profile" className="flex items-center gap-2">
            <User className="size-4" />
            <span className="hidden sm:inline">{user?.name || "Profil"}</span>
          </Link>
        </Button>
        <Button
          size="sm"
          type="button"
          variant="ghost"
          className="h-8 px-2 sm:px-3"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}