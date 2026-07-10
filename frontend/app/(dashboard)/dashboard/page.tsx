"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import { Activity, Box, Building2, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { Product } from "@/types/product";

const DashboardCharts = dynamic(
  () => import("@/components/dashboard/dashboard-charts").then((module) => module.DashboardCharts),
  { ssr: false, loading: () => <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><Card className="h-80" /><Card className="h-80" /></div> }
);

export default function DashboardPage() {
  const productsQuery = useProducts({ page: 1, per_page: 100 });
  const products = productsQuery.data?.data ?? [];

  const summary = useMemo(() => {
    const active = products.filter((product) => product.status !== "Disposal").length;
    const maintenance = products.filter((product) => product.status === "Maintenance").length;
    const disposal = products.filter((product) => product.status === "Disposal").length;

    return {
      total: products.length,
      active,
      maintenance,
      disposal,
    };
  }, [products]);

  const recentActivity = useMemo(() => {
    return [...products]
      .sort((left, right) => {
        const leftTime = left.updated_at || left.created_at || "";
        const rightTime = right.updated_at || right.created_at || "";
        return new Date(rightTime).getTime() - new Date(leftTime).getTime();
      })
      .slice(0, 5);
  }, [products]);

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
            <Button type="button">Lihat Inventory</Button>
            <Button type="button" variant="outline">
              Tambah Asset
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Asset"
          description="Jumlah asset yang terdaftar"
          value={summary.total}
          icon={<Box className="size-5" />}
          isLoading={productsQuery.isLoading}
        />
        <SummaryCard
          title="Asset Aktif"
          description="Asset tidak dalam status Disposal"
          value={summary.active}
          icon={<Activity className="size-5" />}
          isLoading={productsQuery.isLoading}
        />
        <SummaryCard
          title="Maintenance"
          description="Asset dalam pemeliharaan"
          value={summary.maintenance}
          icon={<Wrench className="size-5" />}
          isLoading={productsQuery.isLoading}
        />
        <SummaryCard
          title="Disposal"
          description="Asset yang sudah dipindahkan"
          value={summary.disposal}
          icon={<Building2 className="size-5" />}
          isLoading={productsQuery.isLoading}
        />
      </div>

      <DashboardCharts products={products} isLoading={productsQuery.isLoading} />

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>Asset yang terakhir diperbarui atau ditambahkan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {productsQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          ) : recentActivity.length ? (
            recentActivity.map((product) => (
              <div key={product.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {product.no_asset || product.no_serial || `Asset #${product.id}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.tipe || "Tanpa tipe"} • {formatDate(product.updated_at || product.created_at)}
                  </p>
                </div>
                <StatusBadge status={product.status} />
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Belum ada aktivitas inventory yang bisa ditampilkan.
            </p>
          )}
        </CardContent>
      </Card>
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

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Aktif"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Disposal"
        ? "border-zinc-200 bg-zinc-50 text-zinc-700"
        : status === "Maintenance"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>{status || "-"}</span>;
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