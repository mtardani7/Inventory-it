"use client";

import dynamic from "next/dynamic";
import { useCallback, useDeferredValue, useMemo, useState, useEffect } from "react";
import { AlertCircle, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { InventoryToolbar } from "@/components/inventory/inventory-toolbar";
import {
  useCreateProduct,
  useDeleteProduct,
  useDisposeProduct,
  useExportProductsExcel,
  useExportProductsPdf,
  useExportTemplateExcel,
  useImportProducts,
  useProducts,
  useUpdateProduct,
} from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Product, ProductPayload } from "@/types/product";
import { INVENTORY_COLUMN_META } from "@/components/inventory/inventory-columns";
import { ColumnVisibilityMenu } from "@/components/inventory/column-visibility-menu";
import { ImportProductResponse } from "@/services/product.service";

const InventoryTable = dynamic(
  () => import("@/components/inventory/inventory-table").then((module) => module.InventoryTable),
  { ssr: false, loading: () => <div className="rounded-lg border p-6 text-sm text-muted-foreground">Memuat tabel inventory...</div> }
);

const InventoryDialog = dynamic(
  () => import("@/components/inventory/inventory-dialog").then((module) => module.InventoryDialog),
  { ssr: false, loading: () => null }
);

const InventoryDetailDialog = dynamic(
  () => import("@/components/inventory/inventory-detail-dialog").then((module) => module.InventoryDetailDialog),
  { ssr: false, loading: () => null }
);

const ImportExportPanel = dynamic(
  () => import("@/components/inventory/import-export-panel").then((module) => module.ImportExportPanel),
  { ssr: false, loading: () => <div className="rounded-lg border p-6 text-sm text-muted-foreground">Memuat panel impor dan ekspor...</div> }
);

const InventoryPagination = dynamic(
  () => import("@/components/inventory/inventory-pagination").then((module) => module.InventoryPagination),
  { ssr: false, loading: () => <div className="h-10" /> }
);

type DialogMode = "create" | "edit" | "view";
type ConfirmationAction = "delete" | "disposal" | null;

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [plant, setPlant] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>(null);
  const [confirmationProduct, setConfirmationProduct] = useState<Product | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean> | undefined>(() => {
    try {
      const raw = localStorage.getItem("inventory:column_visibility");
      if (raw) return JSON.parse(raw);

      const m: Record<string, boolean> = {};
      INVENTORY_COLUMN_META.forEach((c) => {
        m[c.id] = c.defaultVisible ?? true;
      });
      return m;
    } catch (e) {
      return undefined;
    }
  });

  useEffect(() => {
    try {
      if (columnVisibility) {
        localStorage.setItem("inventory:column_visibility", JSON.stringify(columnVisibility));
      }
    } catch (e) {
      // ignore
    }
  }, [columnVisibility]);

  const deferredSearch = useDeferredValue(search);
  const params = useMemo(
    () => ({
      page,
      per_page: perPage,
      search: deferredSearch || undefined,
      plant: plant === "all" ? undefined : plant,
      status: status === "all" ? undefined : status,
      sort: sortField === "id" ? undefined : sortField,
      order: sortField === "id" ? undefined : sortOrder,
    }),
    [deferredSearch, page, perPage, plant, status, sortField, sortOrder]
  );

  const productsQuery = useProducts(params);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const disposeProduct = useDisposeProduct();
  const importProducts = useImportProducts();
  const exportTemplateExcel = useExportTemplateExcel();
  const exportProductsExcel = useExportProductsExcel();
  const exportProductsPdf = useExportProductsPdf();

  const isMutating =
    createProduct.isPending ||
    updateProduct.isPending ||
    deleteProduct.isPending ||
    disposeProduct.isPending ||
    importProducts.isPending;

  const exportingType = exportTemplateExcel.isPending
    ? "template"
    : exportProductsExcel.isPending
      ? "excel"
      : exportProductsPdf.isPending
        ? "pdf"
        : null;

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
    }
  }, []);

  const openCreateDialog = useCallback(() => {
    setSelectedProduct(null);
    setDialogMode("create");
    setDialogOpen(true);
  }, []);

  const handleSortChange = useCallback((field: string, order: "asc" | "desc") => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
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

  const openConfirmation = useCallback((product: Product, action: ConfirmationAction) => {
    setConfirmationProduct(product);
    setConfirmationAction(action);
    setConfirmationOpen(true);
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmationOpen(false);
    setConfirmationProduct(null);
    setConfirmationAction(null);
  }, []);

  const handleDelete = useCallback(
    (product: Product) => {
      openConfirmation(product, "delete");
    },
    [openConfirmation]
  );

  const handleDisposal = useCallback(
    (product: Product) => {
      openConfirmation(product, "disposal");
    },
    [openConfirmation]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!confirmationProduct || !confirmationAction) {
      return;
    }

    try {
      if (confirmationAction === "delete") {
        await deleteProduct.mutateAsync(confirmationProduct.id);
        toast.success("Asset berhasil dihapus.");
      } else {
        await disposeProduct.mutateAsync({
          id: confirmationProduct.id,
          payload: {
            status: "Disposal",
          },
        });
        toast.success("Asset berhasil dipindahkan ke Disposal.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      closeConfirmation();
    }
  }, [closeConfirmation, confirmationAction, confirmationProduct, deleteProduct, disposeProduct]
  );

  const handleImportFile = useCallback(async (file: File, onUploadProgress?: (progress: number) => void): Promise<ImportProductResponse> => {
    const result = await importProducts.mutateAsync({
      file,
      onUploadProgress,
    });

    await productsQuery.refetch();

    return result;
  }, [importProducts, productsQuery]);

  const handleDownloadTemplate = useCallback(() => {
    void (async () => {
      try {
        const response = await exportTemplateExcel.mutateAsync();
        triggerBlobDownload(
          response.data,
          getFilenameFromDisposition(response.headers["content-disposition"], "inventory-template.xlsx")
        );
        toast.success("Template Excel berhasil diunduh.");
      } catch (error) {
        toast.error(await getDownloadErrorMessage(error));
      }
    })();
  }, [exportTemplateExcel]);

  const handleExportExcel = useCallback(() => {
    void (async () => {
      try {
        const response = await exportProductsExcel.mutateAsync({
          search: deferredSearch || undefined,
          plant: plant === "all" ? undefined : plant,
          status: status === "all" ? undefined : status,
          sort: sortField === "id" ? undefined : sortField,
          order: sortField === "id" ? undefined : sortOrder,
        });

        triggerBlobDownload(
          response.data,
          getFilenameFromDisposition(response.headers["content-disposition"], "inventory-export.xlsx")
        );
        toast.success("Export Excel berhasil.");
      } catch (error) {
        toast.error(await getDownloadErrorMessage(error));
      }
    })();
  }, [deferredSearch, exportProductsExcel, plant, sortField, sortOrder, status]);

  const handleExportPdf = useCallback(() => {
    void (async () => {
      try {
        const response = await exportProductsPdf.mutateAsync({
          search: deferredSearch || undefined,
          plant: plant === "all" ? undefined : plant,
          status: status === "all" ? undefined : status,
          sort: sortField === "id" ? undefined : sortField,
          order: sortField === "id" ? undefined : sortOrder,
        });

        triggerBlobDownload(
          response.data,
          getFilenameFromDisposition(response.headers["content-disposition"], "inventory-export.pdf")
        );
        toast.success("Export PDF berhasil.");
      } catch (error) {
        toast.error(await getDownloadErrorMessage(error));
      }
    })();
  }, [deferredSearch, exportProductsPdf, plant, sortField, sortOrder, status]);

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

      <ImportExportPanel
        totalProducts={productsQuery.data?.total ?? 0}
        isImporting={importProducts.isPending}
        exportingType={exportingType}
        onImportFile={handleImportFile}
        onDownloadTemplate={handleDownloadTemplate}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
      />

      {/* Column visibility controls (persisted to localStorage) */}
      <div className="flex justify-end">
        <ColumnVisibilityMenu
          columns={INVENTORY_COLUMN_META.map((c) => ({ id: c.id, label: c.label }))}
          visibility={columnVisibility}
          onChange={(next) => setColumnVisibility(next)}
        />
      </div>

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
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={(next) => setColumnVisibility(next)}
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

      {dialogMode !== "view" && (
        <InventoryDialog
          mode={dialogMode}
          open={dialogOpen}
          product={selectedProduct}
          isSubmitting={createProduct.isPending || updateProduct.isPending}
          onOpenChange={handleDialogOpenChange}
          onSubmit={handleSubmit}
        />
      )}

      <InventoryDetailDialog
        open={dialogMode === "view" && dialogOpen}
        product={selectedProduct}
        onOpenChange={handleDialogOpenChange}
      />

      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={closeConfirmation}
        title={
          confirmationAction === "delete"
            ? "Konfirmasi Hapus Asset"
            : "Konfirmasi Disposal Asset"
        }
        description={
          confirmationProduct
            ? confirmationAction === "delete"
              ? `Hapus asset ${confirmationProduct.no_asset || confirmationProduct.no_serial || `ID ${confirmationProduct.id}`} dari inventory?`
              : `Ubah asset ${confirmationProduct.no_asset || confirmationProduct.no_serial || `ID ${confirmationProduct.id}`} menjadi Disposal?`
            : "Pilih asset untuk melanjutkan."
        }
        confirmLabel={
          confirmationAction === "delete" ? "Hapus" : "Jadikan Disposal"
        }
        cancelLabel="Batal"
        isConfirming={deleteProduct.isPending || disposeProduct.isPending}
        onConfirm={handleConfirmAction}
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

function triggerBlobDownload(blob: Blob, fileName: string) {
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
      return `Gagal mengunduh file. (${status})`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Gagal mengunduh file.";
}
