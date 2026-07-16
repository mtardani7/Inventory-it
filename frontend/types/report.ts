export interface ReportSummary {
  total_assets: number;
  active_assets: number;
  disposal_assets: number;
  repair_assets: number;
}

export interface ReportItem {
  id: number;
  no_asset: string | null;
  no_serial: string | null;
  tipe: string | null;
  plant: string | null;
  pengguna: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ReportGroupItem {
  name: string;
  total: number;
}

export interface ReportFilters {
  search?: string;
  plant?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface ReportsPayload {
  filters: ReportFilters;
  summary: ReportSummary;
  plant_report: ReportGroupItem[];
  status_report: ReportGroupItem[];
  user_report: ReportGroupItem[];
  growth_report: Array<{ month: string; total: number }>;
  inventory_report: ReportItem[];
}

export interface ReportsResponse {
  message: string;
  data: ReportsPayload;
}
