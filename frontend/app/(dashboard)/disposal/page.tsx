"use client";

import { useMemo, useState } from "react";
import { ArchiveX, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { DisposalDialog } from "@/components/disposal/disposal-dialog";
import { DisposalTable } from "@/components/disposal/disposal-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useDeleteProduct, useProducts, useUpdateProduct } from "@/hooks/use-products";
import { Product } from "@/types/product";

export default function DisposalPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogMode, setDialogMode] = useState<"restore" | "delete">("restore");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const productsQuery = useProducts({ page: 1, per_page: 100, status: "Disposal" });
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const disposedAssets = useMemo(() => productsQuery.data?.data ?? [], [productsQuery.data?.data]);

  const openDialog = (product: Product, mode: "restore" | "delete") => {
    setSelectedProduct(product);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleRestore = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: selectedProduct.id,
        payload: { status: "Aktif" },
      });
      toast.success("Asset berhasil dipulihkan.");
      closeDialog();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(selectedProduct.id);
      toast.success("Asset berhasil dihapus permanen.");
      closeDialog();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleConfirm = dialogMode === "restore" ? handleRestore : handlePermanentDelete;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <section className="rounded-3xl border border-border bg-background/90 p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Disposal</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Disposal History</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Pantau asset yang sudah dipindahkan ke disposal, pulihkan kapan diperlukan, atau hapus permanen bila sudah tidak digunakan.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => productsQuery.refetch()}>
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArchiveX className="size-4" />
                Daftar Disposal
              </CardTitle>
              <CardDescription>
                {disposedAssets.length} asset saat ini dalam disposal.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DisposalTable
            data={disposedAssets}
            isLoading={productsQuery.isLoading}
            isMutating={updateProduct.isPending || deleteProduct.isPending}
            onRestore={(product) => openDialog(product, "restore")}
            onPermanentDelete={(product) => openDialog(product, "delete")}
          />
        </CardContent>
      </Card>

      <DisposalDialog
        open={dialogOpen}
        product={selectedProduct}
        mode={dialogMode}
        isSubmitting={updateProduct.isPending || deleteProduct.isPending}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedProduct(null);
          }
        }}
        onConfirm={() => setConfirmationOpen(true)}
      />

      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title={dialogMode === "restore" ? "Pulihkan Asset" : "Hapus Permanen Asset"}
        description={
          dialogMode === "restore"
            ? "Asset akan dikembalikan ke inventory utama."
            : "Asset akan dihapus permanen dari sistem."
        }
        confirmLabel={dialogMode === "restore" ? "Pulihkan" : "Hapus Permanen"}
        cancelLabel="Batal"
        isConfirming={updateProduct.isPending || deleteProduct.isPending}
        onConfirm={() => {
          setConfirmationOpen(false);
          void handleConfirm();
        }}
      />
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}