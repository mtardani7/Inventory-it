"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Boxes,
  Building2,
  Database,
  LockKeyhole,
  LaptopMinimal,
  MoonStar,
  PackageCheck,
  QrCode,
  ServerCog,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SunMedium,
  Trash2,
  Users2,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTheme } from "@/app/theme-provider";
import { useAuthContext } from "@/providers/auth-provider";
import { useReports } from "@/hooks/use-reports";

const features: Array<{ title: string; description: string; icon: LucideIcon }> = [
  { title: "Asset Management", description: "Inventaris perangkat, ownership, lifecycle, dan status operasional dalam satu panel kerja.", icon: Boxes },
  { title: "QR Code", description: "Tagging dan scanning asset lebih cepat untuk stock opname, mutasi, dan audit lapangan.", icon: QrCode },
  { title: "Maintenance", description: "Preventive dan corrective maintenance dengan histori pekerjaan yang dapat ditelusuri.", icon: Wrench },
  { title: "Disposal", description: "Alur disposal terdokumentasi dari pengajuan, approval, hingga berita acara.", icon: Trash2 },
  { title: "Reporting", description: "Rekap KPI, utilisasi, aging asset, dan trend maintenance untuk pengambilan keputusan.", icon: Database },
  { title: "Multi Plant", description: "Kontrol operasional lintas plant dengan segmentasi lokasi dan distribusi asset real-time.", icon: Building2 },
  { title: "Multi User", description: "Akses berbasis peran untuk admin, PIC plant, teknisi, auditor, dan manajemen.", icon: Users2 },
];

const timeline = [
  { phase: "01", title: "Asset Intake", description: "Registrasi asset baru, assignment plant, dan generate QR tag." },
  { phase: "02", title: "Operational Control", description: "Tracking owner, mutasi, peminjaman, dan health perangkat secara harian." },
  { phase: "03", title: "Maintenance Cycle", description: "Jadwal servis, worklog teknisi, sparepart, dan SLA maintenance." },
  { phase: "04", title: "Disposal & Audit", description: "Approval disposal, dokumentasi final, dan laporan kepatuhan audit." },
];

const technologies = [
  { name: "Laravel", icon: ServerCog },
  { name: "Next.js", icon: LaptopMinimal },
  { name: "Docker", icon: Boxes },
  { name: "MySQL", icon: Database },
  { name: "Apache", icon: ShieldCheck },
  { name: "PWA", icon: Smartphone },
];

const chartColors = ["#38bdf8", "#2dd4bf", "#818cf8", "#f59e0b", "#ef4444", "#64748b"];

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function PreviewEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-background/60 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <LockKeyhole className="size-5" />
      </div>
      <p className="mt-4 text-base font-semibold">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function StatisticCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] backdrop-blur-sm">
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500/20 to-teal-400/20 text-cyan-600 dark:text-cyan-300">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      className="border-white/15 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 dark:border-white/10 dark:bg-white/5"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
    </Button>
  );
}

export default function LandingPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const reportsQuery = useReports({}, { enabled: isAuthenticated });
  const report = reportsQuery.data;

  const summaryCards = useMemo(() => {
    if (!report) {
      return [
        { label: "Total Asset", value: "-", helper: "Tampilkan setelah login", icon: PackageCheck },
        { label: "Asset Aktif", value: "-", helper: "Mengikuti summary laporan", icon: Sparkles },
        { label: "Total Plant", value: "-", helper: "Dihitung dari data plant", icon: Building2 },
        { label: "Status Tercatat", value: "-", helper: "Dihitung dari kategori status", icon: Database },
        { label: "Asset Perbaikan", value: "-", helper: "Status Maintenance atau Rusak", icon: Wrench },
        { label: "Asset Disposal", value: "-", helper: "Status Disposal", icon: Trash2 },
      ];
    }

    return [
      { label: "Total Asset", value: report.summary.total_assets.toLocaleString("id-ID"), helper: "Seluruh asset terdaftar", icon: PackageCheck },
      { label: "Asset Aktif", value: report.summary.active_assets.toLocaleString("id-ID"), helper: "Status aktif saat ini", icon: Sparkles },
      { label: "Total Plant", value: report.plant_report.length.toLocaleString("id-ID"), helper: "Plant dengan asset terdata", icon: Building2 },
      { label: "Status Tercatat", value: report.status_report.length.toLocaleString("id-ID"), helper: "Jumlah kategori status", icon: Database },
      { label: "Asset Perbaikan", value: report.summary.repair_assets.toLocaleString("id-ID"), helper: "Maintenance dan rusak", icon: Wrench },
      { label: "Asset Disposal", value: report.summary.disposal_assets.toLocaleString("id-ID"), helper: "Siap proses disposal", icon: Trash2 },
    ];
  }, [report]);

  const growthData = useMemo(() => {
    return (report?.growth_report ?? []).map((item) => {
      const date = new Date(`${item.month}-01T00:00:00`);

      return {
        month: Number.isNaN(date.getTime())
          ? item.month
          : new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(date),
        total: item.total,
      };
    });
  }, [report]);

  const statusData = useMemo(() => {
    return (report?.status_report ?? []).map((item, index) => ({
      ...item,
      color: chartColors[index % chartColors.length],
    }));
  }, [report]);

  const inventoryPreview = report?.inventory_report ?? [];
  const hasRealtimeData = !!report;

  return (
    <main className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.12),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1)_22%,rgba(7,10,20,1)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.12),transparent_22%),linear-gradient(180deg,rgba(2,6,23,1),rgba(2,6,23,1)_22%,rgba(2,6,23,1)_100%)]" />
      <div className="animate-pulse-grid absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />

      <section className="px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-28 lg:pt-8">
        <div className="mx-auto max-w-7xl">
          <header className="animate-fade-up flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white/90 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-sky-400 via-cyan-300 to-teal-300 text-slate-950 shadow-[0_18px_45px_-24px_rgba(34,211,238,0.9)]">
                <Boxes className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.28em] text-cyan-200 uppercase">Inventory IT</p>
                <p className="text-xs text-slate-300">Enterprise Asset Control</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="outline" className="hidden border-white/15 bg-white/10 text-white hover:bg-white/20 sm:inline-flex">
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </header>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div className="animate-fade-up text-white" style={{ animationDelay: "120ms" }}>
              <Badge variant="outline" className="border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-cyan-100">
                ERP-style Asset Operations Platform
              </Badge>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-7xl">
                Inventory IT Management System untuk kontrol asset yang cepat, rapi, dan siap audit.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Halaman utama publik untuk memperkenalkan sistem inventory enterprise. Jika sesi login tersedia, landing page ini langsung menampilkan ringkasan dan preview laporan dari data inventory yang ada.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-11 bg-cyan-300 px-5 text-slate-950 hover:bg-cyan-200">
                  <Link href="/login">
                    Masuk
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 border-white/15 bg-white/8 px-5 text-white hover:bg-white/15">
                  <Link href="#preview">Pelajari Sistem</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Governance</p>
                  <p className="mt-2 text-lg font-semibold">Lifecycle & approval flow</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Visibility</p>
                  <p className="mt-2 text-lg font-semibold">Realtime plant monitoring</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Readiness</p>
                  <p className="mt-2 text-lg font-semibold">Realtime reporting saat login</p>
                </div>
              </div>
            </div>

            <div className="animate-fade-up animate-float relative" style={{ animationDelay: "240ms" }}>
              <div className="absolute -inset-6 rounded-[2rem] bg-cyan-300/10 blur-3xl" />
              <Card className="relative border border-white/10 bg-white/8 text-white shadow-[0_40px_120px_-48px_rgba(34,211,238,0.5)] backdrop-blur-xl">
                <CardHeader className="border-b border-white/10 pb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-white">Executive Overview</CardTitle>
                      <CardDescription className="text-slate-300">Unified control center for assets, plants, status, and audit visibility</CardDescription>
                    </div>
                    <Badge className="bg-emerald-400/15 text-emerald-200">{hasRealtimeData ? "Data Existing" : "Public Preview"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ringkasan Data</p>
                      <p className="mt-3 text-3xl font-semibold">{hasRealtimeData ? report.summary.total_assets.toLocaleString("id-ID") : "-"}</p>
                      <p className="mt-2 text-sm text-slate-300">{hasRealtimeData ? "Jumlah seluruh asset pada laporan inventory." : "Masuk untuk memuat angka aktual dari sistem."}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Akses Realtime</p>
                      <p className="mt-3 text-3xl font-semibold">{hasRealtimeData ? "On" : "Off"}</p>
                      <p className="mt-2 text-sm text-slate-300">{hasRealtimeData ? "Landing page sedang menampilkan report existing." : "Landing page publik tetap aktif tanpa membuka data privat."}</p>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Growth Report</p>
                        <p className="text-xs text-slate-400">Trend berdasarkan data existing pada modul laporan</p>
                      </div>
                      <Database className="size-4 text-cyan-200" />
                    </div>
                    <div className="h-52">
                      {hasRealtimeData && growthData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={growthData}>
                            <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
                            <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: 18,
                                border: "1px solid rgba(255,255,255,0.08)",
                                backgroundColor: "rgba(2,6,23,0.92)",
                                color: "#e2e8f0",
                              }}
                            />
                            <Line type="monotone" dataKey="total" stroke="#67e8f9" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <PreviewEmptyState
                          title={isAuthLoading ? "Memeriksa sesi" : "Preview growth tersedia setelah login"}
                          description="Landing page publik tidak menampilkan angka buatan. Grafik akan memuat data pertumbuhan dari report existing ketika sesi autentikasi tersedia."
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 bg-background/95 px-4 py-16 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-up flex items-end justify-between gap-6">
            <div>
              <Badge variant="outline" className="border-border bg-background/70">Statistik Sistem</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Ringkasan yang mengikuti data laporan existing.</h2>
            </div>
            <p className="hidden max-w-xl text-sm leading-7 text-muted-foreground lg:block">
              Tidak ada angka dummy di section ini. Saat belum login, card tetap tampil sebagai preview UI tanpa mengarang nilai statistik.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map(({ label, value, helper, icon: Icon }, index) => (
              <div key={label} className="animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                <StatisticCard label={label} value={value} helper={helper} icon={Icon} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-up flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="outline" className="border-border bg-background/70">Dashboard Preview</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Preview dashboard modern dengan grafik, KPI card, dan tabel dari report existing.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Desain diarahkan ke nuansa enterprise seperti ERP, SAP, dan Freshservice: padat informasi, bersih, mudah dipindai, dan hanya memakai data yang memang tersedia.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <Card className="animate-fade-up border-border/60 bg-card/80 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)]" style={{ animationDelay: "100ms" }}>
              <CardHeader className="border-b border-border/60 pb-5">
                <CardTitle>Trend dan Beban Operasional</CardTitle>
                <CardDescription>Plant report, status report, dan growth report dari modul laporan inventory.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 pt-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="mb-3 text-sm font-medium">Asset Growth</p>
                  <div className="h-64">
                    {hasRealtimeData && growthData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growthData}>
                          <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="total" stroke="#0891b2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <PreviewEmptyState
                        title="Growth report belum dimuat"
                        description="Masuk ke sistem untuk menampilkan tren pertumbuhan asset dari data laporan yang sudah ada."
                      />
                    )}
                  </div>
                </div>
                <div className="grid gap-6">
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                    <p className="mb-3 text-sm font-medium">Asset per Plant</p>
                    <div className="h-40">
                      {hasRealtimeData && report.plant_report.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={report.plant_report}>
                            <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#14b8a6" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <PreviewEmptyState
                          title="Plant report belum dimuat"
                          description="Distribusi plant akan menggunakan report existing setelah autentikasi aktif."
                        />
                      )}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                    <p className="mb-3 text-sm font-medium">Asset per Status</p>
                    <div className="h-40">
                      {hasRealtimeData && statusData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={statusData} dataKey="total" nameKey="name" innerRadius={42} outerRadius={66} paddingAngle={2}>
                              {statusData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <PreviewEmptyState
                          title="Status report belum dimuat"
                          description="Proporsi status akan ditampilkan dari data laporan yang sudah ada, tanpa dummy data."
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-up border-border/60 bg-card/80" style={{ animationDelay: "180ms" }}>
              <CardHeader className="border-b border-border/60 pb-5">
                <CardTitle>KPI Snapshot</CardTitle>
                <CardDescription>Ringkasan singkat yang mengikuti response modul laporan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="rounded-3xl border border-border/60 bg-background/70 p-5">
                  <p className="text-sm text-muted-foreground">Inventory Records</p>
                  <p className="mt-3 text-4xl font-semibold">{hasRealtimeData ? inventoryPreview.length.toLocaleString("id-ID") : "-"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{hasRealtimeData ? "Jumlah row preview yang dikirim endpoint report." : "Preview akan aktif ketika ada sesi login yang valid."}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-5">
                    <p className="text-sm text-muted-foreground">Top Users</p>
                    <p className="mt-3 text-3xl font-semibold">{hasRealtimeData ? report.user_report.length.toLocaleString("id-ID") : "-"}</p>
                  </div>
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-5">
                    <p className="text-sm text-muted-foreground">Status Groups</p>
                    <p className="mt-3 text-3xl font-semibold">{hasRealtimeData ? report.status_report.length.toLocaleString("id-ID") : "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-up mt-6 border-border/60 bg-card/80" style={{ animationDelay: "260ms" }}>
            <CardHeader className="border-b border-border/60 pb-5">
              <CardTitle>Table Preview</CardTitle>
              <CardDescription>Cuplikan inventaris dari `inventory_report` dengan kolom preview yang lebih lengkap.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {hasRealtimeData && inventoryPreview.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No Asset</TableHead>
                      <TableHead>No Serial</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Plant</TableHead>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryPreview.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.no_asset || "-"}</TableCell>
                        <TableCell>{row.no_serial || "-"}</TableCell>
                        <TableCell>{row.tipe || "-"}</TableCell>
                        <TableCell>{row.plant || "-"}</TableCell>
                        <TableCell>{row.pengguna || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-background/80">{row.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(row.created_at)}</TableCell>
                        <TableCell>{formatDate(row.updated_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <PreviewEmptyState
                  title="Table preview menunggu autentikasi"
                  description="Tabel ini hanya akan menampilkan row nyata dari endpoint report. Untuk pengunjung publik, komponen tetap terlihat tanpa mengisi data palsu."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-up max-w-2xl">
            <Badge variant="outline" className="border-border bg-background/70">Fitur Utama</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Dirancang untuk operasi inventory IT lintas plant dan lintas tim.</h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ title, description, icon: Icon }, index) => (
              <Card key={title} className="animate-fade-up border-border/60 bg-card/80" style={{ animationDelay: `${index * 70}ms` }}>
                <CardContent className="pt-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500/15 to-teal-400/15 text-cyan-600 dark:text-cyan-300">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-up max-w-2xl">
            <Badge variant="outline" className="border-border bg-background/70">Timeline Sistem</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Alur kerja sistem dari intake asset sampai disposal.</h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {timeline.map((item, index) => (
              <Card key={item.phase} className="animate-fade-up relative border-border/60 bg-card/80" style={{ animationDelay: `${index * 90}ms` }}>
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold tracking-[0.24em] text-cyan-600 uppercase dark:text-cyan-300">{item.phase}</p>
                  <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="animate-fade-up max-w-2xl">
            <Badge variant="outline" className="border-border bg-background/70">Screenshot Dashboard</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Tampilan dashboard yang tetap fokus pada produktivitas operator.</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Screenshot bawaan aplikasi tetap dipakai sebagai referensi visual agar landing page terhubung dengan pengalaman produk yang sebenarnya, tanpa mengarang isi data.
            </p>
          </div>

          <div className="animate-fade-up rounded-[2rem] border border-border/60 bg-card/80 p-3 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]" style={{ animationDelay: "120ms" }}>
            <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
              <Image
                src="/screenshots/dashboard-wide.png"
                alt="Inventory IT dashboard screenshot"
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-up max-w-2xl">
            <Badge variant="outline" className="border-border bg-background/70">Teknologi</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Stack modern untuk operasi inventory yang aman dan scalable.</h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {technologies.map(({ name, icon: Icon }, index) => (
              <div key={name} className="animate-fade-up flex items-center gap-4 rounded-3xl border border-border/60 bg-card/80 p-5" style={{ animationDelay: `${index * 70}ms` }}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500/15 to-teal-400/15 text-cyan-600 dark:text-cyan-300">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">Production-ready foundation</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Inventory IT</p>
            <p className="text-sm text-muted-foreground">Landing page publik untuk sistem inventory enterprise berbasis Next.js dan Laravel.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Masuk ke Sistem</Link>
            </Button>
          </div>
        </div>
      </footer>
    </main>
  );
}