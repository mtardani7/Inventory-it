"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export function ProfileCard() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Perbarui nama dan email akun Anda.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Nama</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Email</span>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <Button
          type="button"
          onClick={() => updateProfile({ name, email })}
        >
          <Save className="size-4" />
          Simpan Profil
        </Button>
      </CardContent>
    </Card>
  );
}
