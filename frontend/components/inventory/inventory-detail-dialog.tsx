"use client";

import { Activity, CalendarClock, FileText, History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types/product";

interface InventoryDetailDialogProps {
  open: boolean;
  product?: Product | null;
  onOpenChange: (open: boolean) => void;
}

const detailFields: Array<{
  label: string;
  value?: string | number | null;
}> = [
  { label: "No Asset", value: "no_asset" },
  { label: "Serial Number", value: "no_serial" },
  { label: "No Equipment", value: "no_equipment" },
  { label: "Tipe", value: "tipe" },
  { label: "Tahun Pembuatan", value: "tahun_pembuatan" },
  { label: "Usage Date", value: "usage_date" },
  { label: "Pengguna", value: "pengguna" },
  { label: "Computer Name", value: "computer_name" },
  { label: "Plant", value: "plant" },
  { label: "Status", value: "status" },
  { label: "Usage Record", value: "usage_record" },
  { label: "Keterangan", value: "keterangan" },
];

export function InventoryDetailDialog({
  open,
  product,
  onOpenChange,
}: InventoryDetailDialogProps) {
  if (!product) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detail Asset</DialogTitle>
          <DialogDescription>
            Informasi lengkap aset IT yang tersimpan dalam inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
          {detailFields.map((field) => {
            const rawValue = product[field.value as keyof Product];
            const value = typeof rawValue === "string" ? rawValue : rawValue ?? "-";
            const isStatusField = field.label === "Status";

            return (
              <div key={field.label} className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
                {isStatusField ? (
                  <Badge variant="outline" className="font-medium">
                    {String(value)}
                  </Badge>
                ) : (
                  <p className="text-sm">{String(value)}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" />
              <h3 className="font-medium">Timeline</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Dibuat</p>
                <p>{formatDate(product.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Terakhir diperbarui</p>
                <p>{formatDate(product.updated_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal pemakaian</p>
                <p>{product.usage_date || "-"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2">
              <History className="size-4 text-primary" />
              <h3 className="font-medium">Usage History</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-muted/50 p-3">
                <p className="font-medium">Pengguna</p>
                <p className="text-muted-foreground">{product.pengguna || "-"}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="font-medium">Computer Name</p>
                <p className="text-muted-foreground">{product.computer_name || "-"}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="font-medium">Usage Record</p>
                <p className="text-muted-foreground">{product.usage_record || "-"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <h3 className="font-medium">Activity Log</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-md border border-dashed p-3">
                <p className="font-medium">Status saat ini</p>
                <p className="text-muted-foreground">{product.status || "-"}</p>
              </div>
              <div className="rounded-md border border-dashed p-3">
                <p className="font-medium">Plant</p>
                <p className="text-muted-foreground">{product.plant || "-"}</p>
              </div>
              <div className="rounded-md border border-dashed p-3">
                <p className="font-medium">Catatan</p>
                <p className="text-muted-foreground">{product.keterangan || "-"}</p>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
