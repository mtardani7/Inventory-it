"use client";

import { Archive, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/types/product";

interface InventoryActionProps {
  product: Product;
  disabled?: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDisposal: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function InventoryAction({
  product,
  disabled = false,
  onView,
  onEdit,
  onDisposal,
  onDelete,
}: InventoryActionProps) {
  const isDisposed = product.status === "Disposal";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            aria-label="Buka aksi inventory"
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onView(product)}>
          <Eye />
          Detail
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onEdit(product)}>
          <Pencil />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={isDisposed}
          onClick={() => onDisposal(product)}
        >
          <Archive />
          Disposal
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(product)}
        >
          <Trash2 />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
