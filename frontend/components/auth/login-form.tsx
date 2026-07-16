"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

type AuthErrorResponse = {
  message?: string;
};

export function LoginForm() {
  const login = useLogin();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login.mutateAsync(values);
      toast.success("Login berhasil");
      router.replace("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<AuthErrorResponse>;

      toast.error(
        axiosError.response?.data?.message ??
          "Email atau password salah."
      );
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Masuk ke Inventory IT</CardTitle>
        <CardDescription>Kelola aset, disposal, dan laporan dengan aman.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {login.isError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {(login.error as AxiosError<AuthErrorResponse>)?.response?.data?.message ?? "Login gagal."}
            </p>
          ) : null}

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                type="email"
                placeholder="admin@inventory.test"
                autoComplete="email"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                type="password"
                placeholder="password123"
                autoComplete="current-password"
                {...register("password")}
              />
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </label>

          <Button className="w-full" type="submit" disabled={isSubmitting || login.isPending}>
            {isSubmitting || login.isPending ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
