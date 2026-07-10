import { z } from "zod";

import { PRODUCT_STATUS_OPTIONS } from "@/types/product";

const emptyToNull = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value));

const nullableText = (max = 191) =>
  emptyToNull.refine((value) => value === null || value.length <= max, {
    message: `Maksimal ${max} karakter.`,
  });

export const productSchema = z.object({
  no_serial: nullableText(),
  no_asset: nullableText(),
  no_equipment: nullableText(),
  tipe: nullableText(),
  tahun_pembuatan: emptyToNull.refine(
    (value) => value === null || /^(19|20)\d{2}$/.test(value),
    {
      message: "Tahun harus 4 digit, contoh 2024.",
    }
  ),
  // usage_date should be an ISO date (YYYY-MM-DD) or empty
  usage_date: emptyToNull.refine(
    (value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
    {
      message: "Tanggal harus dalam format YYYY-MM-DD (gunakan pemilih tanggal).",
    }
  ),
  pengguna: nullableText(),
  computer_name: nullableText(),
  plant: nullableText(),
  usage_record: nullableText(500),
  keterangan: nullableText(1000),
  status: z.enum(PRODUCT_STATUS_OPTIONS),
});

export type ProductFormValues = z.input<typeof productSchema>;
export type ProductValidatedValues = z.output<typeof productSchema>;
