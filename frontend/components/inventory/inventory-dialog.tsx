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
    // If tahun_pembuatan stored as YYYY-MM-DD (from backend conversion), extract year
    tahun_pembuatan:
      product.tahun_pembuatan && /^\d{4}-\d{2}-\d{2}$/.test(product.tahun_pembuatan)
        ? product.tahun_pembuatan.split("-")[0]
        : product.tahun_pembuatan ?? "",
    // Only present usage_date if it's an ISO date string (YYYY-MM-DD)
    usage_date: product.usage_date && /^\d{4}-\d{2}-\d{2}$/.test(product.usage_date)
      ? product.usage_date
      : "",
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
  const isFieldDisabled = isView || isSubmitting;
  const title =
    mode === "create" ? "Tambah Asset" : mode === "edit" ? "Edit Asset" : "Detail Asset";
  const submitLabel = mode === "create" ? "Simpan" : "Perbarui";

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
    if (isView) {
      return;
    }

    await onSubmit(toPayload(values));
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const plant = watch("plant");
  const status = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95dvh] w-[calc(100%-1rem)] overflow-y-auto rounded-2xl p-3 sm:max-w-4xl sm:p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isView
              ? "Informasi asset IT yang tersimpan."
              : "Lengkapi data asset sesuai informasi perangkat."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={isView ? (event) => event.preventDefault() : handleSubmit(submit)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="No Asset" error={errors.no_asset?.message}>
              <Input disabled={isFieldDisabled} readOnly={isView} {...register("no_asset")} />
            </FormField>

            <FormField label="Serial Number" error={errors.no_serial?.message}>
              <Input disabled={isFieldDisabled} readOnly={isView} {...register("no_serial")} />
            </FormField>

            <FormField label="No Equipment" error={errors.no_equipment?.message}>
              <Input disabled={isFieldDisabled} readOnly={isView} {...register("no_equipment")} />
            </FormField>

            <FormField label="Tipe" error={errors.tipe?.message}>
              <Input disabled={isFieldDisabled} readOnly={isView} {...register("tipe")} />
            </FormField>

            <FormField label="Tahun Pembuatan" error={errors.tahun_pembuatan?.message}>
              <>
                <Input
                  disabled={isFieldDisabled}
                  type="number"
                  inputMode="numeric"
                  placeholder="2024"
                  min={1900}
                  max={new Date().getFullYear()}
                  readOnly={isView}
                  {...register("tahun_pembuatan")}
                />
                <span className="text-xs text-muted-foreground">Masukkan tahun (YYYY), contohnya 2024.</span>
              </>
            </FormField>

            <FormField label="Usage Date" error={errors.usage_date?.message}>
              <>
                <Input
                  disabled={isFieldDisabled}
                  type="date"
                  placeholder="Pilih tanggal"
                  readOnly={isView}
                  {...register("usage_date")}
                />
                <span className="text-xs text-muted-foreground">Pilih tanggal penggunaan dari kalender.</span>
              </>
            </FormField>

            <FormField label="Pengguna" error={errors.pengguna?.message}>
              <Input disabled={isFieldDisabled} readOnly={isView} {...register("pengguna")} />
            </FormField>

            <FormField label="Computer Name" error={errors.computer_name?.message}>
              <Input disabled={isFieldDisabled} readOnly={isView} {...register("computer_name")} />
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
                disabled={isFieldDisabled}
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
                disabled={isFieldDisabled}
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
              <Textarea disabled={isFieldDisabled} readOnly={isView} {...register("usage_record")} />
            </FormField>

            <FormField label="Keterangan" error={errors.keterangan?.message}>
              <Textarea disabled={isFieldDisabled} readOnly={isView} {...register("keterangan")} />
            </FormField>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
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
                {submitLabel}
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
