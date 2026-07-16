"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlertCircle, Clock4, Filter, List, Timeline } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryPagination } from "@/components/inventory/inventory-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAssetHistories, useAssetHistory, useAssetHistoryUsers } from "@/hooks/use-asset-histories";
import { ASSET_HISTORY_ACTIONS, AssetHistory } from "@/types/asset-history";

export default function AssetHistoryPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [userId, setUserId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const deferredSearch = useDeferredValue(search);

  const params = useMemo(
    () => ({
      page,
      per_page: perPage,
      search: deferredSearch || undefined,
      action: action === "all" ? undefined : action,
      user_id: userId === "all" ? undefined : Number(userId),
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [action, dateFrom, dateTo, deferredSearch, page, perPage, userId]
  );

  const historiesQuery = useAssetHistories(params);
  const usersQuery = useAssetHistoryUsers();
  const detailQuery = useAssetHistory(selectedId ?? 0, !!selectedId);

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Asset History</h1>
        <p className="text-sm text-muted-foreground">Pantau jejak perubahan aset: create, update, delete, disposal, restore, dan import.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-4" />
            Filter History
          </CardTitle>
          <CardDescription>Gunakan pencarian dan filter untuk menelusuri histori aset.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Input
            placeholder="Cari asset, deskripsi, aksi..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="lg:col-span-2"
          />

          <Select
            value={action}
            onValueChange={(value) => {
              setAction(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Action</SelectItem>
              {ASSET_HISTORY_ACTIONS.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={userId}
            onValueChange={(value) => {
              setUserId(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua User</SelectItem>
              {usersQuery.data?.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }}
          />

          <Input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {historiesQuery.data?.total ?? 0} history ditemukan
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <List className="size-4" />
            Table
          </Button>
          <Button
            type="button"
            variant={viewMode === "timeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("timeline")}
          >
            <Timeline className="size-4" />
            Timeline
          </Button>
        </div>
      </div>

      {historiesQuery.isError ? (
        <ErrorState onRetry={() => historiesQuery.refetch()} message={getErrorMessage(historiesQuery.error)} />
      ) : historiesQuery.isLoading ? (
        <LoadingState />
      ) : !historiesQuery.data?.data.length ? (
        <EmptyState />
      ) : viewMode === "table" ? (
        <HistoryTable histories={historiesQuery.data.data} onViewDetail={setSelectedId} />
      ) : (
        <TimelineView histories={historiesQuery.data.data} onViewDetail={setSelectedId} />
      )}

      <InventoryPagination
        currentPage={historiesQuery.data?.current_page ?? page}
        from={historiesQuery.data?.from ?? null}
        lastPage={historiesQuery.data?.last_page ?? 1}
        perPage={perPage}
        to={historiesQuery.data?.to ?? null}
        total={historiesQuery.data?.total ?? 0}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
      />

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Asset History</DialogTitle>
            <DialogDescription>Informasi perubahan lengkap untuk histori aset terpilih.</DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detailQuery.data ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <InfoItem label="Action" value={detailQuery.data.action} />
                <InfoItem label="Asset" value={historyAssetLabel(detailQuery.data)} />
                <InfoItem label="User" value={detailQuery.data.user?.name ?? "System"} />
                <InfoItem label="IP Address" value={detailQuery.data.ip_address} />
                <InfoItem label="Tanggal" value={formatDateTime(detailQuery.data.created_at)} />
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-medium">Deskripsi</p>
                <p className="mt-1 text-muted-foreground">{detailQuery.data.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <JsonPreview title="Old Values" value={detailQuery.data.old_values} />
                <JsonPreview title="New Values" value={detailQuery.data.new_values} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Data detail tidak tersedia.</p>
          )}

          <DialogFooter>
            <Button type="button" onClick={() => setSelectedId(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function HistoryTable({ histories, onViewDetail }: { histories: AssetHistory[]; onViewDetail: (id: number) => void }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {histories.map((history) => (
              <TableRow key={history.id}>
                <TableCell>{formatDateTime(history.created_at)}</TableCell>
                <TableCell>
                  <ActionBadge action={history.action} />
                </TableCell>
                <TableCell>{historyAssetLabel(history)}</TableCell>
                <TableCell>{history.user?.name ?? "System"}</TableCell>
                <TableCell className="max-w-[420px] whitespace-normal">{history.description}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => onViewDetail(history.id)}>
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TimelineView({ histories, onViewDetail }: { histories: AssetHistory[]; onViewDetail: (id: number) => void }) {
  return (
    <div className="space-y-3">
      {histories.map((history) => (
        <Card key={history.id}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ActionBadge action={history.action} />
                  <p className="text-sm text-muted-foreground">{formatDateTime(history.created_at)}</p>
                </div>
                <p className="font-medium">{historyAssetLabel(history)}</p>
                <p className="text-sm text-muted-foreground">{history.description}</p>
                <p className="text-xs text-muted-foreground">Oleh: {history.user?.name ?? "System"} · IP: {history.ip_address}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onViewDetail(history.id)}>
                Detail
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const color =
    action === "create"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : action === "delete"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : action === "disposal"
          ? "bg-orange-50 text-orange-700 border-orange-200"
          : action === "restore"
            ? "bg-sky-50 text-sky-700 border-sky-200"
            : action === "import"
              ? "bg-violet-50 text-violet-700 border-violet-200"
              : "bg-zinc-50 text-zinc-700 border-zinc-200";

  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}>{action}</span>;
}

function JsonPreview({ title, value }: { title: string; value: Record<string, unknown> | null }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="font-medium">{title}</p>
      <pre className="mt-2 max-h-56 overflow-auto rounded bg-muted/30 p-2 text-xs">{value ? JSON.stringify(value, null, 2) : "-"}</pre>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value || "-"}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
        <Clock4 className="size-7 text-muted-foreground" />
        <p className="font-medium">Belum ada data history asset.</p>
        <p className="text-sm text-muted-foreground">History akan muncul otomatis saat asset dibuat, diubah, dihapus, disposal, restore, atau import.</p>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <div>
          <p className="font-medium">Gagal memuat data history.</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="outline" onClick={onRetry}>Coba Lagi</Button>
      </CardContent>
    </Card>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function historyAssetLabel(history: AssetHistory) {
  return history.product?.no_asset || history.product?.no_serial || `Asset #${history.product_id}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}
