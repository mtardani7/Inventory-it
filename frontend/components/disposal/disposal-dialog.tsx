"use client";

import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

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

interface DisposalDialogProps {
  open: boolean;
  product?: Product | null;
  mode: "restore" | "delete";
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DisposalDialog({
  open,
  product,
  mode,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: DisposalDialogProps) {
  const isDelete = mode === "delete";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDelete ? <Trash2 className="size-4 text-destructive" /> : <RotateCcw className="size-4" />}
            {isDelete ? "Hapus Permanen" : "Pulihkan Asset"}
          </DialogTitle>
          <DialogDescription>
            {isDelete
              ? `Asset ${product?.no_asset || product?.no_serial || `#${product?.id ?? "-"}`} akan dihapus permanen dari sistem.`
              : `Asset ${product?.no_asset || product?.no_serial || `#${product?.id ?? "-"}`} akan dipulihkan dari disposal.`}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              {isDelete
                ? "Tindakan ini tidak dapat dibatalkan. Pastikan Anda benar-benar ingin menghapus data ini."
                : "Asset akan kembali ke status aktif dan muncul lagi di inventory utama."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            type="button"
            variant={isDelete ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mohon tunggu..." : isDelete ? "Hapus Permanen" : "Pulihkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
