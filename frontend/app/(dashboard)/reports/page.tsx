"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { Download, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useExportReportExcel, useExportReportPdf, useReports } from "@/hooks/use-reports";
import { ReportFilters, ReportGroupItem } from "@/types/report";

const chartColors = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [plant, setPlant] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const deferredSearch = useDeferredValue(search);

  const filters = useMemo<ReportFilters>(() => ({
    search: deferredSearch || undefined,
    plant: plant === "all" ? undefined : plant,
    status: status === "all" ? undefined : status,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [dateFrom, dateTo, deferredSearch, plant, status]);

  const reportsQuery = useReports(filters);
  const exportExcel = useExportReportExcel();
  const exportPdf = useExportReportPdf();

  const report = reportsQuery.data;

  const plantOptions = useMemo(() => {
    return (report?.plant_report ?? []).map((item) => item.name);
  }, [report?.plant_report]);

  const statusOptions = useMemo(() => {
    return (report?.status_report ?? []).map((item) => item.name);
  }, [report?.status_report]);

  const handleExportExcel = async () => {
    try {
      const response = await exportExcel.mutateAsync(filters);
      downloadBlob(
        response.data,
        getFilenameFromDisposition(response.headers["content-disposition"], "reports-inventory.xlsx")
      );
      toast.success("Report Excel berhasil diunduh.");
    } catch (error) {
      toast.error(await getDownloadErrorMessage(error));
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await exportPdf.mutateAsync(filters);
      downloadBlob(
        response.data,
        getFilenameFromDisposition(response.headers["content-disposition"], "reports-inventory.pdf")
      );
      toast.success("Report PDF berhasil diunduh.");
    } catch (error) {
      toast.error(await getDownloadErrorMessage(error));
    }
  };

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Inventory Report, Summary Report, Plant Report, Status Report, dan User Report.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={exportExcel.isPending} onClick={() => void handleExportExcel()}>
            <FileSpreadsheet className="size-4" />
            {exportExcel.isPending ? "Memproses..." : "Export Excel"}
          </Button>
          <Button type="button" variant="outline" disabled={exportPdf.isPending} onClick={() => void handleExportPdf()}>
            <FileText className="size-4" />
            {exportPdf.isPending ? "Memproses..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-4" />
            Date Range & Filters
          </CardTitle>
          <CardDescription>Filter data report berdasarkan tanggal, plant, status, dan kata kunci.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Cari asset, serial, pengguna..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="lg:col-span-2"
          />

          <Select value={plant} onValueChange={setPlant}>
            <SelectTrigger>
              <SelectValue placeholder="Plant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Plant</SelectItem>
              {plantOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </CardContent>
      </Card>

      {reportsQuery.isLoading ? (
        <SummarySkeleton />
      ) : reportsQuery.isError ? (
        <ErrorState message={getErrorMessage(reportsQuery.error)} onRetry={() => reportsQuery.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Total Assets" value={report?.summary.total_assets ?? 0} />
            <SummaryCard title="Active Assets" value={report?.summary.active_assets ?? 0} />
            <SummaryCard title="Disposal Assets" value={report?.summary.disposal_assets ?? 0} />
            <SummaryCard title="Repair Assets" value={report?.summary.repair_assets ?? 0} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Plant Report" description="Distribusi aset per plant">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report?.plant_report ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Status Report" description="Komposisi aset berdasarkan status">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={report?.status_report ?? []} dataKey="total" nameKey="name" outerRadius={100}>
                    {(report?.status_report ?? []).map((item, index) => (
                      <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Asset Growth" description="Pertumbuhan aset berdasarkan bulan pembuatan">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={report?.growth_report ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#14b8a6" fill="#99f6e4" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ReportListCard title="User Report" rows={report?.user_report ?? []} />
            <ReportListCard title="Status Report" rows={report?.status_report ?? []} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Report</CardTitle>
              <CardDescription>50 data aset terbaru sesuai filter report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(report?.inventory_report ?? []).length ? (
                report?.inventory_report.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{item.no_asset || item.no_serial || `Asset #${item.id}`}</p>
                      <p className="text-sm text-muted-foreground">{item.tipe || "Tanpa tipe"} · {item.plant || "Tanpa plant"} · {item.pengguna || "Tanpa pengguna"}</p>
                    </div>
                    <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium">{item.status}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Tidak ada data inventory report untuk filter saat ini.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ReportListCard({ title, rows }: { title: string; rows: ReportGroupItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length ? rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span>{row.name}</span>
            <span className="font-semibold">{row.total}</span>
          </div>
        )) : <p className="text-sm text-muted-foreground">Tidak ada data.</p>}
      </CardContent>
    </Card>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
        <Download className="size-7 text-destructive" />
        <div>
          <p className="font-medium">Gagal memuat laporan</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button type="button" variant="outline" onClick={onRetry}>Coba Lagi</Button>
      </CardContent>
    </Card>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function getFilenameFromDisposition(contentDisposition: string | undefined, fallback: string) {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (basicMatch?.[1]) {
    return basicMatch[1];
  }

  return fallback;
}

async function getDownloadErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (data instanceof Blob) {
      const text = await data.text();

      try {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed.message) {
          return parsed.message;
        }
      } catch {
        // Ignore invalid JSON body.
      }
    }

    if (status) {
      return `Gagal mengunduh report. (${status})`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Gagal mengunduh report.";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}