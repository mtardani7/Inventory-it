"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ProductFormValues,
  ProductValidatedValues,
  productSchema,
} from "@/lib/validations/product";
import {
  PRODUCT_PLANT_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  Product,
  ProductPayload,
} from "@/types/product";

interface InventoryDialogProps {
  mode: "create" | "edit" | "view";
  open: boolean;
  product?: Product | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ProductPayload) => Promise<void> | void;
}

const emptyValues: ProductFormValues = {
  no_serial: "",
  no_asset: "",
  no_equipment: "",
  tipe: "",
  tahun_pembuatan: "",
  usage_date: "",
  pengguna: "",
  computer_name: "",
  plant: "",
  usage_record: "",
  keterangan: "",
  status: "Aktif",
};

function toFormValues(product?: Product | null): ProductFormValues {
  if (!product) {
    return emptyValues;
  }

  return {
    no_serial: product.no_serial ?? "",
    no_asset: product.no_asset ?? "",
    no_equipment: product.no_equipment ?? "",
    tipe: product.tipe ?? "",
    tahun_pembuatan: product.tahun_pembuatan ?? "",
    usage_date: product.usage_date ?? "",
    pengguna: product.pengguna ?? "",
    computer_name: product.computer_name ?? "",
    plant: product.plant ?? "",
    usage_record: product.usage_record ?? "",
    keterangan: product.keterangan ?? "",
    status: PRODUCT_STATUS_OPTIONS.includes(product.status as ProductPayload["status"])
      ? (product.status as ProductPayload["status"])
      : "Aktif",
  };
}

function toPayload(values: ProductValidatedValues): ProductPayload {
  return {
    no_serial: values.no_serial,
    no_asset: values.no_asset,
    no_equipment: values.no_equipment,
    tipe: values.tipe,
    tahun_pembuatan: values.tahun_pembuatan,
    usage_date: values.usage_date,
    pengguna: values.pengguna,
    computer_name: values.computer_name,
    plant: values.plant,
    usage_record: values.usage_record,
    keterangan: values.keterangan,
    status: values.status,
  };
}

export function InventoryDialog({
  mode,
  open,
  product,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: InventoryDialogProps) {
  const isView = mode === "view";
  const title =
    mode === "create" ? "Tambah Asset" : mode === "edit" ? "Edit Asset" : "Detail Asset";

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ProductFormValues, unknown, ProductValidatedValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(product));
    }
  }, [open, product, reset]);

  async function submit(values: ProductValidatedValues) {
    await onSubmit(toPayload(values));
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const plant = watch("plant");
  const status = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isView
              ? "Informasi asset IT yang tersimpan."
              : "Lengkapi data asset sesuai informasi perangkat."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(submit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="No Asset" error={errors.no_asset?.message}>
              <Input disabled={isView || isSubmitting} {...register("no_asset")} />
            </FormField>

            <FormField label="Serial Number" error={errors.no_serial?.message}>
              <Input disabled={isView || isSubmitting} {...register("no_serial")} />
            </FormField>

            <FormField label="No Equipment" error={errors.no_equipment?.message}>
              <Input disabled={isView || isSubmitting} {...register("no_equipment")} />
            </FormField>

            <FormField label="Tipe" error={errors.tipe?.message}>
              <Input disabled={isView || isSubmitting} {...register("tipe")} />
            </FormField>

            <FormField label="Tahun Pembuatan" error={errors.tahun_pembuatan?.message}>
              <Input
                disabled={isView || isSubmitting}
                inputMode="numeric"
                maxLength={4}
                placeholder="2024"
                {...register("tahun_pembuatan")}
              />
            </FormField>

            <FormField label="Usage Date" error={errors.usage_date?.message}>
              <Input
                disabled={isView || isSubmitting}
                placeholder="Contoh: 10 Bulan, 11 Hari"
                {...register("usage_date")}
              />
            </FormField>

            <FormField label="Pengguna" error={errors.pengguna?.message}>
              <Input disabled={isView || isSubmitting} {...register("pengguna")} />
            </FormField>

            <FormField label="Computer Name" error={errors.computer_name?.message}>
              <Input disabled={isView || isSubmitting} {...register("computer_name")} />
            </FormField>

            <FormField label="Plant" error={errors.plant?.message}>
              <Select
                value={plant ?? ""}
                onValueChange={(value) =>
                  setValue("plant", value ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={isView || isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih plant" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_PLANT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status" error={errors.status?.message}>
              <Select
                value={status}
                onValueChange={(value) =>
                  setValue("status", (value ?? "Aktif") as ProductPayload["status"], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={isView || isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Usage Record" error={errors.usage_record?.message}>
              <Textarea disabled={isView || isSubmitting} {...register("usage_record")} />
            </FormField>

            <FormField label="Keterangan" error={errors.keterangan?.message}>
              <Textarea disabled={isView || isSubmitting} {...register("keterangan")} />
            </FormField>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              {isView ? "Tutup" : "Batal"}
            </Button>

            {!isView && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : mode === "create" ? (
                  <Plus />
                ) : (
                  <Save />
                )}
                Simpan
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  );
}
