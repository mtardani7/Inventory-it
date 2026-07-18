export interface PublicDashboardSummary {
  total_asset: number;
  total_asset_active: number;
  total_asset_maintenance: number;
  total_asset_disposal: number;
  total_user: number;
  total_plant: number;
  total_category: number;
  total_vendor: number;
  total_brand: number;
  total_location: number;
}

export interface PublicDashboardChartItem {
  name: string;
  total: number;
}

export interface PublicDashboardMonthlyItem {
  month: string;
  total: number;
}

export interface PublicDashboardAsset {
  id: number;
  asset_code: string | null;
  serial_number: string | null;
  equipment_code: string | null;
  asset_name: string | null;
  category: string | null;
  plant: string | null;
  user_name: string | null;
  computer_name: string | null;
  usage_record: string | null;
  description: string | null;
  status: string;
  manufacture_year: string | null;
  usage_date: string | null;
  history_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PublicDashboardActivity {
  id: number;
  action: string;
  description: string;
  created_at: string | null;
  asset: {
    id: number;
    asset_code: string | null;
    serial_number: string | null;
    asset_name: string | null;
    status: string | null;
  } | null;
  actor: {
    id: number;
    name: string;
  } | null;
}

export interface PublicDashboardPayload {
  summary: PublicDashboardSummary;
  charts: {
    asset_per_plant: PublicDashboardChartItem[];
    asset_per_category: PublicDashboardChartItem[];
    asset_condition: PublicDashboardChartItem[];
    asset_procurement_monthly: PublicDashboardMonthlyItem[];
  };
  recent_activity: PublicDashboardActivity[];
  latest_asset: PublicDashboardAsset[];
}

export interface PublicDashboardResponse {
  success: boolean;
  message: string;
  data: PublicDashboardPayload;
}