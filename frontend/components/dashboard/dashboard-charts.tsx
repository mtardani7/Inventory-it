"use client";

import { memo, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, PRODUCT_STATUS_OPTIONS } from "@/types/product";

const chartColors = ["#2563eb", "#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444", "#64748b"];

interface DashboardChartsProps {
  products: Product[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const DashboardCharts = memo(function DashboardCharts({
  products,
  isLoading = false,
  isError = false,
  onRetry,
}: DashboardChartsProps) {
  const plantData = useMemo(() => {
    const map = new Map<string, number>();

    products.forEach((product) => {
      const plant = product.plant || "Tidak ada";
      map.set(plant, (map.get(plant) ?? 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value);
  }, [products]);

  const statusData = useMemo(() => {
    return PRODUCT_STATUS_OPTIONS.map((status, index) => ({
      name: status,
      value: products.filter((product) => product.status === status).length,
      color: chartColors[index % chartColors.length],
    })).filter((item) => item.value > 0);
  }, [products]);

  const growthData = useMemo(() => {
    const monthlyMap = new Map<string, number>();

    products.forEach((product) => {
      if (!product.created_at) {
        return;
      }

      const date = new Date(product.created_at);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
    });

    return Array.from(monthlyMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);

        return {
          month: new Intl.DateTimeFormat("id-ID", {
            month: "short",
            year: "numeric",
          }).format(date),
          value,
        };
      });
  }, [products]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Asset per Plant</CardTitle>
          <CardDescription>Distribusi aset berdasarkan plant.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-2">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : isError ? (
            <ChartErrorState onRetry={onRetry} />
          ) : !plantData.length ? (
            <ChartEmptyState message="Belum ada data plant." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plantData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset per Status</CardTitle>
          <CardDescription>Proporsi asset berdasarkan status saat ini.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-2">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : isError ? (
            <ChartErrorState onRetry={onRetry} />
          ) : !statusData.length ? (
            <ChartEmptyState message="Belum ada data status." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Asset Growth</CardTitle>
          <CardDescription>Pertumbuhan jumlah aset berdasarkan bulan pembuatan data.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-2">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : isError ? (
            <ChartErrorState onRetry={onRetry} />
          ) : !growthData.length ? (
            <ChartEmptyState message="Belum ada data pertumbuhan aset." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-destructive/40 text-center">
      <AlertCircle className="size-5 text-destructive" />
      <p className="text-sm text-muted-foreground">Gagal memuat data chart.</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Coba Lagi
      </Button>
    </div>
  );
}
