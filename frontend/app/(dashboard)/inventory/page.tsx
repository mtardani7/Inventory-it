"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { AlertCircle, PackageSearch } from "lucide-react";
import { toast } from "sonner";

import { InventoryDialog } from "@/components/inventory/inventory-dialog";
import { InventoryPagination } from "@/components/inventory/inventory-pagination";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryToolbar } from "@/components/inventory/inventory-toolbar";
import {
  useCreateProduct,
  useDeleteProduct,
  useDisposeProduct,
  useProducts,
  useUpdateProduct,
} from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Product, ProductPayload } from "@/types/product";

type DialogMode = "create" | "edit" | "view";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [plant, setPlant] = useState("all");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const deferredSearch = useDeferredValue(search);
  const params = useMemo(
    () => ({
      page,
      per_page: perPage,
      search: deferredSearch || undefined,
      plant: plant === "all" ? undefined : plant,
      status: status === "all" ? undefined : status,
    }),
    [deferredSearch, page, perPage, plant, status]
  );

  const productsQuery = useProducts(params);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const disposeProduct = useDisposeProduct();

  const isMutating =
    createProduct.isPending ||
    updateProduct.isPending ||
    deleteProduct.isPending ||
    disposeProduct.isPending;

  const openCreateDialog = useCallback(() => {
    setSelectedProduct(null);
    setDialogMode("create");
    setDialogOpen(true);
  }, []);

  const openViewDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDialogMode("view");
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDialogMode("edit");
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (payload: ProductPayload) => {
      try {
        if (dialogMode === "edit" && selectedProduct) {
          await updateProduct.mutateAsync({
            id: selectedProduct.id,
            payload,
          });
          toast.success("Asset berhasil diperbarui.");
        } else {
          await createProduct.mutateAsync(payload);
          toast.success("Asset berhasil ditambahkan.");
        }

        setDialogOpen(false);
        setSelectedProduct(null);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [createProduct, dialogMode, selectedProduct, updateProduct]
  );

  const handleDelete = useCallback(
    async (product: Product) => {
      const label = product.no_asset || product.no_serial || `ID ${product.id}`;
      const confirmed = window.confirm(`Hapus asset ${label}?`);

      if (!confirmed) {
        return;
      }

      try {
        await deleteProduct.mutateAsync(product.id);
        toast.success("Asset berhasil dihapus.");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [deleteProduct]
  );

  const handleDisposal = useCallback(
    async (product: Product) => {
      const label = product.no_asset || product.no_serial || `ID ${product.id}`;
      const confirmed = window.confirm(`Ubah asset ${label} menjadi Disposal?`);

      if (!confirmed) {
        return;
      }

      try {
        await disposeProduct.mutateAsync({
          id: product.id,
          payload: {
            status: "Disposal",
          },
        });
        toast.success("Asset berhasil dipindahkan ke Disposal.");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [disposeProduct]
  );

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Inventory IT</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data perangkat, pengguna, plant, status, dan riwayat pemakaian.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
          <PackageSearch className="size-4" />
          {productsQuery.data?.total ?? 0} asset
        </div>
      </div>

      <InventoryToolbar
        isRefreshing={productsQuery.isFetching}
        plant={plant}
        search={search}
        status={status}
        onAdd={openCreateDialog}
        onRefresh={() => productsQuery.refetch()}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPlantChange={(value) => {
          setPlant(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
      />

      {productsQuery.isError ? (
        <ErrorState
          message={getErrorMessage(productsQuery.error)}
          onRetry={() => productsQuery.refetch()}
        />
      ) : (
        <>
          <InventoryTable
            actionDisabled={isMutating}
            data={productsQuery.data?.data ?? []}
            isLoading={productsQuery.isLoading}
            onDelete={handleDelete}
            onDisposal={handleDisposal}
            onEdit={openEditDialog}
            onView={openViewDialog}
          />

          <InventoryPagination
            currentPage={productsQuery.data?.current_page ?? page}
            from={productsQuery.data?.from ?? null}
            lastPage={productsQuery.data?.last_page ?? 1}
            perPage={perPage}
            to={productsQuery.data?.to ?? null}
            total={productsQuery.data?.total ?? 0}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
          />
        </>
      )}

      <InventoryDialog
        mode={dialogMode}
        open={dialogOpen}
        product={selectedProduct}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <div>
        <h2 className="font-medium">Gagal mengambil data inventory.</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button type="button" variant="outline" onClick={onRetry}>
        Coba Lagi
      </Button>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}
