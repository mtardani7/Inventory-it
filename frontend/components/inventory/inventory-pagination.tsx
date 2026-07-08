"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryPaginationProps {
  currentPage: number;
  from: number | null;
  lastPage: number;
  perPage: number;
  to: number | null;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function InventoryPagination({
  currentPage,
  from,
  lastPage,
  onPageChange,
  onPerPageChange,
  perPage,
  to,
  total,
}: InventoryPaginationProps) {
  const pages = getVisiblePages(currentPage, lastPage);

  return (
    <div className="flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-muted-foreground">
        {total > 0 ? (
          <>
            Menampilkan <span className="font-medium text-foreground">{from}</span>-
            <span className="font-medium text-foreground">{to}</span> dari{" "}
            <span className="font-medium text-foreground">{total}</span> asset
          </>
        ) : (
          "Belum ada asset"
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(perPage)}
          onValueChange={(value) => onPerPageChange(Number(value ?? perPage))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          aria-label="Halaman pertama"
          disabled={currentPage <= 1}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft />
        </Button>

        <Button
          aria-label="Halaman sebelumnya"
          disabled={currentPage <= 1}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
        </Button>

        {pages.map((page) => (
          <Button
            key={page}
            size="sm"
            type="button"
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          aria-label="Halaman berikutnya"
          disabled={currentPage >= lastPage}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight />
        </Button>

        <Button
          aria-label="Halaman terakhir"
          disabled={currentPage >= lastPage}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(lastPage)}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}

function getVisiblePages(currentPage: number, lastPage: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(lastPage, currentPage + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
