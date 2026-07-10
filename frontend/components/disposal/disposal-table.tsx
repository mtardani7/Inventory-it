"use client";

import { AlertCircle, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";

interface DisposalTableProps {
  data: Product[];
  isLoading?: boolean;
  isMutating?: boolean;
  onRestore: (product: Product) => void;
  onPermanentDelete: (product: Product) => void;
}

export function DisposalTable({
  data,
  isLoading = false,
  isMutating = false,
  onRestore,
  onPermanentDelete,
}: DisposalTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-background p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-background p-8 text-center">
        <AlertCircle className="size-8 text-muted-foreground" />
        <p className="font-medium">Belum ada asset disposal.</p>
        <p className="text-sm text-muted-foreground">
          Asset yang dipindahkan ke disposal akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="divide-y">
        {data.map((product) => (
          <div key={product.id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">
                  {product.no_asset || product.no_serial || `Asset #${product.id}`}
                </p>
                <Badge variant="outline" className="border-zinc-200 bg-zinc-50 text-zinc-700">
                  Disposal
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.tipe || "Tanpa tipe"} • {product.pengguna || "Tidak ada pengguna"} • {product.plant || "Tanpa plant"}
              </p>
              <p className="text-xs text-muted-foreground">
                Terakhir diperbarui: {product.updated_at ? new Date(product.updated_at).toLocaleDateString("id-ID") : "-"}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onRestore(product)}
                disabled={isMutating}
              >
                <RotateCcw className="size-4" />
                Restore
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => onPermanentDelete(product)}
                disabled={isMutating}
              >
                <Trash2 className="size-4" />
                Hapus Permanen
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
