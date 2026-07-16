"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Activity, AlertCircle, Box, Building2, FileSpreadsheet, Upload, Wrench } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCharts } from "../../../components/dashboard/dashboard-charts";
import { useProducts } from "@/hooks/use-products";
import { Product } from "@/types/product";

export default function DashboardPage() {
  const productsQuery = useProducts({ page: 1, per_page: 100 });
  const products = useMemo(() => productsQuery.data?.data ?? [], [productsQuery.data?.data]);

  const isLoading = productsQuery.isLoading;
  const isError = productsQuery.isError;
  const hasData = products.length > 0;

  const summary = useMemo(() => {
    const active = products.filter((product) => product.status === "Aktif").length;
    const repair = products.filter((product) => product.status === "Maintenance" || product.status === "Rusak").length;
    const disposal = products.filter((product) => product.status === "Disposal").length;

    return {
      total: products.length,
      active,
      repair,
      disposal,
    };
  }, [products]);

  const latestCreatedAssets = useMemo(() => {
    return [...products]
      .filter((product) => !!product.created_at)
      .sort((left, right) => new Date(right.created_at || "").getTime() - new Date(left.created_at || "").getTime())
      .slice(0, 5);
  }, [products]);

  const latestUpdatedAssets = useMemo(() => {
    return [...products]
      .filter((product) => !!(product.updated_at || product.created_at))
      .sort((left, right) => {
        const leftTime = left.updated_at || left.created_at || "";
        const rightTime = right.updated_at || right.created_at || "";
        return new Date(rightTime).getTime() - new Date(leftTime).getTime();
      })
      .slice(0, 5);
  }, [products]);

  const handleExportExcel = () => {
    if (!products.length) {
      toast.info("Belum ada data asset untuk diekspor.");
      return;
    }

    const rows = [
      ["no_asset", "no_serial", "no_equipment", "tipe", "tahun_pembuatan", "usage_date", "pengguna", "computer_name", "plant", "usage_record", "keterangan", "status"],
      ...products.map((product) => [
        product.no_asset ?? "",
        product.no_serial ?? "",
        product.no_equipment ?? "",
        product.tipe ?? "",
        product.tahun_pembuatan ?? "",
        product.usage_date ?? "",
        product.pengguna ?? "",
        product.computer_name ?? "",
        product.plant ?? "",
        product.usage_record ?? "",
        product.keterangan ?? "",
        product.status ?? "",
      ]),
    ];

    downloadFile(toCsv(rows), "dashboard-assets-export.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    toast.success("Export Excel berhasil diproses.");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-background/90 p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Ringkasan Inventory IT</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Pantau jumlah aset, distribusi plant, status operasional, dan aktivitas terbaru dari satu halaman.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild type="button">
              <Link href="/inventory">Lihat Inventory</Link>
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/inventory">
              Tambah Asset
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {isError ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Gagal memuat data dashboard</p>
                <p className="text-sm text-muted-foreground">{getErrorMessage(productsQuery.error)}</p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={() => void productsQuery.refetch()}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Assets"
          description="Jumlah aset yang terdaftar"
          value={summary.total}
          icon={<Box className="size-5" />}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Active Assets"
          description="Aset dengan status Aktif"
          value={summary.active}
          icon={<Activity className="size-5" />}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Disposal Assets"
          description="Aset dengan status Disposal"
          value={summary.disposal}
          icon={<Building2 className="size-5" />}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Repair Assets"
          description="Aset status Maintenance atau Rusak"
          value={summary.repair}
          icon={<Wrench className="size-5" />}
          isLoading={isLoading}
        />
      </div>

      <DashboardCharts products={products} isLoading={isLoading} isError={isError} onRetry={() => void productsQuery.refetch()} />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Aksi cepat untuk manajemen asset harian.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button asChild type="button" className="justify-start">
            <Link href="/inventory">Add Asset</Link>
          </Button>
          <Button asChild type="button" variant="outline" className="justify-start">
            <Link href="/inventory">
              <Upload className="size-4" />
              Import Excel
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            disabled={!hasData || isLoading}
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="size-4" />
            Export Excel
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <RecentActivityCard
          title="Latest Created Assets"
          description="Aset yang paling baru ditambahkan."
          products={latestCreatedAssets}
          isLoading={isLoading}
          dateSelector={(product) => product.created_at}
          emptyMessage="Belum ada aset yang pernah dibuat."
        />
        <RecentActivityCard
          title="Latest Updated Assets"
          description="Aset yang paling akhir diperbarui."
          products={latestUpdatedAssets}
          isLoading={isLoading}
          dateSelector={(product) => product.updated_at || product.created_at}
          emptyMessage="Belum ada perubahan data aset."
        />
      </section>

      {!isLoading && !isError && !hasData ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-base font-medium">Belum ada data aset</p>
            <p className="mt-1 text-sm text-muted-foreground">Tambahkan aset pertama untuk menampilkan insight dashboard.</p>
            <Button asChild className="mt-4" type="button">
              <Link href="/inventory">Add Asset</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

const SummaryCard = memo(function SummaryCard({
  title,
  description,
  value,
  icon,
  isLoading,
}: {
  title: string;
  description: string;
  value: number;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-10 w-20" /> : <p className="text-3xl font-semibold">{value}</p>}
      </CardContent>
    </Card>
  );
});

const RecentActivityCard = memo(function RecentActivityCard({
  title,
  description,
  products,
  isLoading,
  dateSelector,
  emptyMessage,
}: {
  title: string;
  description: string;
  products: Product[];
  isLoading: boolean;
  dateSelector: (product: Product) => string | null;
  emptyMessage: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))
        ) : products.length ? (
          products.map((product) => (
            <div key={title + "-" + product.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{product.no_asset || product.no_serial || "Asset #" + product.id}</p>
                <p className="text-sm text-muted-foreground">
                  {product.tipe || "Tanpa tipe"} • {formatDate(dateSelector(product))}
                </p>
              </div>
              <StatusBadge status={product.status} />
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
});

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Aktif"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Disposal"
        ? "border-zinc-200 bg-zinc-50 text-zinc-700"
        : status === "Maintenance"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return <span className={"inline-flex rounded-full border px-2.5 py-1 text-xs font-medium " + className}>{status || "-"}</span>;
});

function formatDate(value: string | null) {
  if (!value) {
    return "Belum tersedia";
  }

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function toCsv(rows: Array<Array<string>>) {
  return rows
    .map((row) => row.map((cell) => "\"" + String(cell).replaceAll("\"", "\"\"") + "\"").join(","))
    .join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string }>;

  return axiosError.response?.data?.message ?? "Terjadi kesalahan saat mengambil data dashboard.";
}