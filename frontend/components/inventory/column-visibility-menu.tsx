"use client";

import { useCallback } from "react";
import { List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColumnMeta {
  id: string;
  label: string;
}

interface ColumnVisibilityMenuProps {
  columns: ColumnMeta[];
  visibility: Record<string, boolean> | undefined;
  onChange: (next: Record<string, boolean>) => void;
}

export function ColumnVisibilityMenu({ columns, visibility, onChange }: ColumnVisibilityMenuProps) {
  const handleToggle = useCallback(
    (id: string) => {
      const next = { ...(visibility ?? {}) };
      next[id] = !next[id];
      onChange(next);
    },
    [visibility, onChange]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex items-center gap-2")}> 
          <List />
          <span>Kolom</span>
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={visibility ? !!visibility[col.id] : true}
            onCheckedChange={() => handleToggle(col.id)}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
