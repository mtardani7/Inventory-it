"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
}

export const DashboardCharts = memo(function DashboardCharts({ products, isLoading = false }: DashboardChartsProps) {
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

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Asset per Plant</CardTitle>
          <CardDescription>Distribusi aset berdasarkan plant.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-2">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
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
    </div>
  );
});
