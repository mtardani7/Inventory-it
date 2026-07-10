"use client";

import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export function LoginForm() {
  const [email, setEmail] = useState("admin@inventory.test");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        throw new Error("Email dan password wajib diisi.");
      }
      await login(email, password, rememberMe);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Masuk ke Inventory IT</CardTitle>
        <CardDescription>Kelola aset, disposal, dan laporan dengan aman.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@inventory.test" />
            </div>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password123" />
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input checked={rememberMe} className="size-4" type="checkbox" onChange={(event) => setRememberMe(event.target.checked)} />
            <span>Remember me</span>
          </label>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <button className="hover:text-foreground" type="button">Forgot password?</button>
            <span>Demo account ready</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
