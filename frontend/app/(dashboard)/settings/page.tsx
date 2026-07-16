"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaveSetting, useSetting } from "@/hooks/use-setting";
import { Setting } from "@/types/setting";

interface SettingFormState {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  default_language: "id" | "en";
  default_theme: "light" | "dark" | "system";
}

const initialForm: SettingFormState = {
  company_name: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  default_language: "id",
  default_theme: "system",
};

export default function SettingsPage() {
  const settingQuery = useSetting();
  const saveMutation = useSaveSetting();

  const [draftForm, setDraftForm] = useState<Partial<SettingFormState>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const baseForm = useMemo<SettingFormState>(() => {
    const data = settingQuery.data;
    if (!data) {
      return initialForm;
    }

    return {
      company_name: data.company_name ?? "",
      company_address: data.company_address ?? "",
      company_phone: data.company_phone ?? "",
      company_email: data.company_email ?? "",
      default_language: data.default_language ?? "id",
      default_theme: data.default_theme ?? "system",
    };
  }, [settingQuery.data]);

  const form: SettingFormState = {
    ...baseForm,
    ...draftForm,
  };

  const isSaving = saveMutation.isPending;

  const hasData = useMemo(() => Boolean(settingQuery.data), [settingQuery.data]);

  const onLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);

    if (!file) {
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await saveMutation.mutateAsync({
        ...form,
        company_logo: logoFile,
      });

      setDraftForm({});
      setLogoFile(null);
      setLogoPreview(null);
      toast.success("Settings berhasil disimpan.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (settingQuery.isLoading && !hasData) {
    return <SettingsSkeleton />;
  }

  if (settingQuery.isError && !hasData) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            Gagal memuat data settings.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">General Settings untuk Company Profile, Upload Logo, Theme, dan Language.</p>
      </div>

      <form className="space-y-6" onSubmit={(event) => void onSubmit(event)}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Atur default theme dan language aplikasi.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Default Theme</p>
              <Select
                value={form.default_theme}
                onValueChange={(value: "light" | "dark" | "system" | null, _eventDetails) => {
                  if (!value) return;
                  setDraftForm((prev) => ({ ...prev, default_theme: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Default Language</p>
              <Select
                value={form.default_language}
                onValueChange={(value: "id" | "en" | null, _eventDetails) => {
                  if (!value) return;
                  setDraftForm((prev) => ({ ...prev, default_language: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Informasi perusahaan yang akan digunakan di modul report dan dokumen.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Company Name</p>
              <Input
                placeholder="PT Rapid Plast Indonesia"
                value={form.company_name}
                onChange={(event) => setDraftForm((prev) => ({ ...prev, company_name: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Company Email</p>
              <Input
                type="email"
                placeholder="company@example.com"
                value={form.company_email}
                onChange={(event) => setDraftForm((prev) => ({ ...prev, company_email: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Company Phone</p>
              <Input
                placeholder="+62..."
                value={form.company_phone}
                onChange={(event) => setDraftForm((prev) => ({ ...prev, company_phone: event.target.value }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium">Company Address</p>
              <Input
                placeholder="Alamat perusahaan"
                value={form.company_address}
                onChange={(event) => setDraftForm((prev) => ({ ...prev, company_address: event.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Logo</CardTitle>
            <CardDescription>Upload logo perusahaan (JPG/PNG/WEBP, maksimal 2MB).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(logoPreview || toPublicAssetUrl(settingQuery.data ?? null)) ? (
              <Image
                src={logoPreview || toPublicAssetUrl(settingQuery.data ?? null) || ""}
                alt="Company logo"
                width={96}
                height={96}
                className="h-24 w-24 rounded-md border object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                No Logo
              </div>
            )}

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
              <Upload className="size-4" />
              Pilih Logo
              <Input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onLogoChange} />
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}

function SettingsSkeleton() {
  return (
    <main className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </main>
  );
}

function toPublicAssetUrl(setting: Setting | null): string | null {
  if (!setting) {
    return null;
  }

  if (!setting.company_logo_url) {
    return null;
  }

  if (setting.company_logo_url.startsWith("http://") || setting.company_logo_url.startsWith("https://")) {
    return setting.company_logo_url;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return setting.company_logo_url;
  }

  const origin = apiBase.replace(/\/api\/?$/, "");

  return `${origin}${setting.company_logo_url}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Gagal menyimpan settings.";
}
