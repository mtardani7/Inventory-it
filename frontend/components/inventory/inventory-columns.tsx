"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { InventoryAction } from "@/components/inventory/inventory-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

interface InventoryColumnHandlers {
  actionDisabled?: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDisposal: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSortChange: (field: string, order: "asc" | "desc") => void;
}

const columnHelper = createColumnHelper<Product>();

export function createInventoryColumns({
  actionDisabled,
  onDelete,
  onDisposal,
  onEdit,
  onView,
  onSortChange,
}: InventoryColumnHandlers) {
  return [
    columnHelper.accessor("no_asset", {
      header: ({ column }) => (
        <SortButton
          label="No Asset"
          onClick={() =>
            onSortChange(column.id, column.getIsSorted() === "asc" ? "desc" : "asc")
          }
        />
      ),
      cell: ({ getValue }) => <StrongValue value={getValue()} />,
    }),
    columnHelper.accessor("no_serial", {
      header: "Serial Number",
      cell: ({ getValue }) => <MutedValue value={getValue()} />,
    }),
    columnHelper.accessor("no_equipment", {
      header: "Equipment",
      cell: ({ getValue }) => <MutedValue value={getValue()} />,
    }),
    columnHelper.accessor("tipe", {
      header: ({ column }) => (
        <SortButton
          label="Tipe"
          onClick={() =>
            onSortChange(column.id, column.getIsSorted() === "asc" ? "desc" : "asc")
          }
        />
      ),
      cell: ({ getValue }) => <MutedValue value={getValue()} />,
    }),
    columnHelper.accessor("computer_name", {
      header: "Computer",
      cell: ({ getValue }) => <MutedValue value={getValue()} />,
    }),
    columnHelper.accessor("pengguna", {
      header: "Pengguna",
      cell: ({ getValue }) => <MutedValue value={getValue()} />,
    }),
    columnHelper.accessor("plant", {
      header: "Plant",
      cell: ({ getValue }) => <MutedValue value={getValue()} />,
    }),
    columnHelper.accessor("usage_date", {
      header: "Usage Date",
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
          try {
            const d = new Date(v);
            const formatted = new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(d);
            return <MutedValue value={formatted} />;
          } catch (e) {
            return <MutedValue value={v} />;
          }
        }

        return <MutedValue value={v} />;
      },
    }),
    columnHelper.accessor("tahun_pembuatan", {
      header: ({ column }) => (
        <SortButton
          label="Tahun"
          onClick={() =>
            onSortChange(column.id, column.getIsSorted() === "asc" ? "desc" : "asc")
          }
        />
      ),
      cell: ({ getValue }) => <MutedValue value={getValue()} />,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? "")} />,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <InventoryAction
            product={row.original}
            disabled={actionDisabled}
            onView={onView}
            onEdit={onEdit}
            onDisposal={onDisposal}
            onDelete={onDelete}
          />
        </div>
      ),
      enableSorting: false,
    }),
  ];
}

function SortButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className="-ml-2"
      size="sm"
      type="button"
      variant="ghost"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown />
    </Button>
  );
}

function StrongValue({ value }: { value: string | number | null }) {
  return <span className="font-medium">{value || "-"}</span>;
}

function MutedValue({ value }: { value: string | number | null }) {
  return <span className="text-muted-foreground">{value || "-"}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const variantClass =
    status === "Aktif"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : status === "Disposal"
        ? "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        : status === "Maintenance"
          ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";

  return (
    <Badge className={variantClass} variant="outline">
      {status || "-"}
    </Badge>
  );
}

export const INVENTORY_COLUMN_META = [
  { id: "no_asset", label: "No Asset", defaultVisible: true },
  { id: "no_serial", label: "Serial Number", defaultVisible: true },
  { id: "no_equipment", label: "Equipment", defaultVisible: true },
  { id: "tipe", label: "Tipe", defaultVisible: true },
  { id: "computer_name", label: "Computer", defaultVisible: true },
  { id: "pengguna", label: "Pengguna", defaultVisible: true },
  { id: "plant", label: "Plant", defaultVisible: true },
  { id: "usage_date", label: "Usage Date", defaultVisible: true },
  { id: "tahun_pembuatan", label: "Tahun", defaultVisible: true },
  { id: "status", label: "Status", defaultVisible: true },
  { id: "actions", label: "Aksi", defaultVisible: true },
];
