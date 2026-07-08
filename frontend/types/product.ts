export interface Product {
  id: number;
  no_serial: string | null;
  no_asset: string | null;
  no_equipment: string | null;
  tipe: string | null;
  tahun_pembuatan: string | null;
  usage_date: string | null;
  pengguna: string | null;
  computer_name: string | null;
  plant: string | null;
  usage_record: string | null;
  keterangan: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export const PRODUCT_STATUS_OPTIONS = [
  "Aktif",
  "Maintenance",
  "Rusak",
  "Disposal",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUS_OPTIONS)[number];

export interface ProductPayload {
  no_serial: string | null;
  no_asset: string | null;
  no_equipment: string | null;
  tipe: string | null;
  tahun_pembuatan: string | null;
  usage_date: string | null;
  pengguna: string | null;
  computer_name: string | null;
  plant: string | null;
  usage_record: string | null;
  keterangan: string | null;
  status: ProductStatus;
}

export const PRODUCT_PLANT_OPTIONS = [
  "Plant 1",
  "Plant 2",
  "Plant 3",
  "Plant 4",
  "Plant 5",
  "Plant 7",
  "Plant 8",
  "JDO",
  "Kimpai",
] as const;
