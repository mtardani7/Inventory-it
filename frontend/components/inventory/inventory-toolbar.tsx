"use client";

import { Loader2, Plus, RefreshCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_PLANT_OPTIONS, PRODUCT_STATUS_OPTIONS } from "@/types/product";

interface InventoryToolbarProps {
  search: string;
  plant: string;
  status: string;
  isRefreshing?: boolean;
  onSearchChange: (value: string) => void;
  onPlantChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
  onAdd: () => void;
}

export function InventoryToolbar({
  isRefreshing = false,
  onAdd,
  onPlantChange,
  onRefresh,
  onSearchChange,
  onStatusChange,
  plant,
  search,
  status,
}: InventoryToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-y bg-background py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari asset, serial, tipe, pengguna..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Select value={plant} onValueChange={(value) => onPlantChange(value ?? "all")}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Plant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Plant</SelectItem>
            {PRODUCT_PLANT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(value) => onStatusChange(value ?? "all")}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {PRODUCT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
          Refresh
        </Button>

        <Button type="button" onClick={onAdd}>
          <Plus />
          Tambah Asset
        </Button>
      </div>
    </div>
  );
}
