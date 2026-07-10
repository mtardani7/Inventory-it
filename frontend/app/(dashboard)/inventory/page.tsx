"use client";

import dynamic from "next/dynamic";
import { useCallback, useDeferredValue, useMemo, useState, useEffect } from "react";
import { AlertCircle, PackageSearch } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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
import { INVENTORY_COLUMN_META } from "@/components/inventory/inventory-columns";
import { ColumnVisibilityMenu } from "@/components/inventory/column-visibility-menu";

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
  const [isImporting, setIsImporting] = useState(false);

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

  const isMutating =
    createProduct.isPending ||
    updateProduct.isPending ||
    deleteProduct.isPending ||
    disposeProduct.isPending;

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

  const handleImportFile = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsvRows(text);
      if (!rows.length) {
        throw new Error("File kosong atau tidak memiliki data yang valid.");
      }

      const headers = rows[0].map((value) => value.trim());
      const requiredHeaders = ["no_asset", "tipe", "pengguna", "plant", "status"];
      const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

      if (missingHeaders.length) {
        throw new Error(`File tidak sesuai format. Kolom wajib: ${missingHeaders.join(", ")}`);
      }

      const invalidRows = rows.slice(1).filter((row) => row.some((value) => value.trim()));
      if (!invalidRows.length) {
        throw new Error("Tidak ada data asset yang dapat diimpor.");
      }

      const payloads = invalidRows.map((row) => {
        const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
        return {
          no_serial: record.no_serial ?? null,
          no_asset: record.no_asset ?? null,
          no_equipment: record.no_equipment ?? null,
          tipe: record.tipe ?? null,
          tahun_pembuatan: record.tahun_pembuatan ?? null,
          usage_date: record.usage_date ?? null,
          pengguna: record.pengguna ?? null,
          computer_name: record.computer_name ?? null,
          plant: record.plant ?? null,
          usage_record: record.usage_record ?? null,
          keterangan: record.keterangan ?? null,
          status: normalizeStatus(record.status ?? "Aktif"),
        } as ProductPayload;
      });

      for (const payload of payloads) {
        await createProduct.mutateAsync(payload);
      }

      toast.success(`${payloads.length} asset berhasil diimpor.`);
      await productsQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  }, [createProduct, productsQuery]);

  const handleDownloadTemplate = useCallback(() => {
    const template = [
      ["no_asset", "no_serial", "no_equipment", "tipe", "tahun_pembuatan", "usage_date", "pengguna", "computer_name", "plant", "usage_record", "keterangan", "status"],
      ["A001", "SN001", "EQ001", "Laptop", "2024", "2024-01-15", "Budi", "PC-01", "1", "Aktif", "", "Aktif"],
    ];
    downloadFile(toCsv(template), "inventory-template.csv", "text/csv;charset=utf-8;");
  }, []);

  const handleExportExcel = useCallback(() => {
    const rows = [
      ["no_asset", "no_serial", "no_equipment", "tipe", "tahun_pembuatan", "usage_date", "pengguna", "computer_name", "plant", "usage_record", "keterangan", "status"],
      ...productsQuery.data?.data?.map((product) => [
        product.no_asset ?? "",
        product.no_serial ?? "",
        product.no_equipment ?? "",
        product.tipe ?? "",
        product.tahun_pembuatan ?? "",
        product.usage_date ?? "",
        product.pengguna ?? "",
        product.computer_name ?? "",
        product.plant ?? "",
        product.usage_record ?? "",
        product.keterangan ?? "",
        product.status ?? "",
      ]) ?? [],
    ];
    downloadFile(toCsv(rows), "inventory-export.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }, [productsQuery.data?.data]);

  const handleExportCsv = useCallback(() => {
    const rows = [
      ["no_asset", "no_serial", "no_equipment", "tipe", "tahun_pembuatan", "usage_date", "pengguna", "computer_name", "plant", "usage_record", "keterangan", "status"],
      ...productsQuery.data?.data?.map((product) => [
        product.no_asset ?? "",
        product.no_serial ?? "",
        product.no_equipment ?? "",
        product.tipe ?? "",
        product.tahun_pembuatan ?? "",
        product.usage_date ?? "",
        product.pengguna ?? "",
        product.computer_name ?? "",
        product.plant ?? "",
        product.usage_record ?? "",
        product.keterangan ?? "",
        product.status ?? "",
      ]) ?? [],
    ];
    downloadFile(toCsv(rows), "inventory-export.csv", "text/csv;charset=utf-8;");
  }, [productsQuery.data?.data]);

  const handleExportPdf = useCallback(() => {
    const rows = productsQuery.data?.data ?? [];
    const content = rows.length
      ? rows.map((product) => `${product.no_asset || "-"} | ${product.tipe || "-"} | ${product.pengguna || "-"} | ${product.plant || "-"} | ${product.status || "-"}`).join("\n")
      : "Tidak ada data asset.";
    const pdfContent = `<!doctype html><html><body><h1>Inventory Export</h1><pre>${escapeHtml(content)}</pre></body></html>`;
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-export.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }, [productsQuery.data?.data]);

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
        isImporting={isImporting}
        onImportFile={handleImportFile}
        onDownloadTemplate={handleDownloadTemplate}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
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

function parseCsvRows(text: string) {
  const rows = text
    .split(/\r?\n/)
    .filter((row) => row.length)
    .map((row) => row.split(",").map((value) => value.trim()));

  return rows;
}

function toCsv(rows: Array<Array<string | number | null>>) {
  return rows
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll(/"/g, '""')}"`).join(","))
    .join("\n");
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeStatus(status: string) {
  const normalized = status?.trim();
  return normalized === "Disposal" || normalized === "Maintenance" || normalized === "Rusak" || normalized === "Aktif"
    ? normalized
    : "Aktif";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
