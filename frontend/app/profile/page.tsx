"use client";

import { ProfileCard } from "@/components/auth/profile-card";

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">Kelola data akun Anda di sini.</p>
      </div>
      <ProfileCard />
    </div>
  );
}
