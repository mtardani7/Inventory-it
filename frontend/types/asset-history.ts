export interface AssetHistoryUser {
  id: number;
  name: string;
  email: string;
}

export interface AssetHistoryProduct {
  id: number;
  no_asset: string | null;
  no_serial: string | null;
  tipe: string | null;
  status: string;
}

export interface AssetHistory {
  id: number;
  product_id: number;
  user_id: number | null;
  action: string;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
  updated_at: string;
  user?: AssetHistoryUser | null;
  product?: AssetHistoryProduct | null;
}

export interface AssetHistoryDetailResponse {
  message: string;
  data: AssetHistory;
}

export interface AssetHistoryUsersResponse {
  data: AssetHistoryUser[];
}

export interface AssetHistoryParams {
  page?: number;
  per_page?: number;
  search?: string;
  action?: string;
  user_id?: number;
  date_from?: string;
  date_to?: string;
}

export const ASSET_HISTORY_ACTIONS = [
  "create",
  "update",
  "delete",
  "disposal",
  "restore",
  "import",
] as const;
