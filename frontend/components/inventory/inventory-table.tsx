"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { Eye, PencilLine, Trash2, Warehouse } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { createInventoryColumns } from "@/components/inventory/inventory-columns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types/product";
import { useIsMobile } from "@/hooks/use-mobile";

interface InventoryTableProps {
  data: Product[];
  isLoading?: boolean;
  actionDisabled?: boolean;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDisposal: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSortChange: (field: string, order: "asc" | "desc") => void;
  /** Column visibility map keyed by column id. If omitted, all columns are shown. */
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
}

const MAX_BODY_HEIGHT = 560;

function InventoryTableComponent({
  actionDisabled = false,
  data,
  isLoading = false,
  onDelete,
  onDisposal,
  onEdit,
  onView,
  onSortChange,
  sortField = "id",
  sortOrder = "desc",
  columnVisibility,
  onColumnVisibilityChange,
}: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const isMobile = useIsMobile();
  const [localColumnVisibility, setLocalColumnVisibility] = useState<
    Record<string, boolean> | undefined
  >(() => columnVisibility ?? undefined);

  useEffect(() => {
    if (columnVisibility) {
      setLocalColumnVisibility(columnVisibility);
    }
  }, [columnVisibility]);

  const columns = useMemo(
    () =>
      createInventoryColumns({
        actionDisabled,
        onDelete,
        onDisposal,
        onEdit,
        onView,
        onSortChange,
      }),
    [actionDisabled, onDelete, onDisposal, onEdit, onView, onSortChange]
  );

  useEffect(() => {
    if (sortField === "id") {
      setSorting([]);
      return;
    }

    setSorting([{ id: sortField, desc: sortOrder === "desc" }]);
  }, [sortField, sortOrder]);

  const handleSortingChange = (updater: React.SetStateAction<SortingState>) => {
    const nextSorting =
      typeof updater === "function" ? updater(sorting) : updater;

    setSorting(nextSorting);

    const [firstSort] = nextSorting;

    if (firstSort) {
      onSortChange(firstSort.id, firstSort.desc ? "desc" : "asc");
      return;
    }

    onSortChange("id", "desc");
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility: localColumnVisibility,
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === "function" ? updater(localColumnVisibility ?? {}) : updater;
      setLocalColumnVisibility(next);
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(next);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const visibleColumns = useMemo(
    () => table.getAllLeafColumns().filter((column) => column.getIsVisible()),
    [table]
  );

  const rows = table.getRowModel().rows;

  if (isMobile) {
    return (
      <div className="space-y-3 rounded-lg border bg-background p-2 sm:p-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border p-3">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="mb-2 h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))
        ) : data.length ? (
          data.map((product) => (
            <div key={product.id} className="rounded-xl border p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{product.no_asset || product.no_serial || `Asset #${product.id}`}</p>
                  <p className="text-sm text-muted-foreground">{product.tipe || "Tanpa tipe"}</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                  {product.status || "-"}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>Pengguna: {product.pengguna || "-"}</p>
                <p>Plant: {product.plant || "-"}</p>
                <p>Usage: {product.usage_date || "-"}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-sm" onClick={() => onView(product)}>
                  <Eye className="size-4" />
                  View
                </button>
                <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-sm" onClick={() => onEdit(product)}>
                  <PencilLine className="size-4" />
                  Edit
                </button>
                <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-sm" onClick={() => onDisposal(product)}>
                  <Warehouse className="size-4" />
                  Disposal
                </button>
                <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-sm text-destructive" onClick={() => onDelete(product)}>
                  <Trash2 className="size-4" />
                  Hapus
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Data inventory tidak ditemukan.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="overflow-y-auto" style={{ maxHeight: `${MAX_BODY_HEIGHT}px` }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/60 hover:bg-muted/60">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-5 w-full min-w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-32 text-center text-muted-foreground"
                  colSpan={columns.length}
                >
                  Data inventory tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const InventoryTable = memo(InventoryTableComponent);