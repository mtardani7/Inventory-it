import { AxiosResponse } from "axios";

import api from "@/lib/axios";
import { ReportFilters, ReportsResponse } from "@/types/report";

export const ReportService = {
  async getReports(params: ReportFilters = {}) {
    const { data } = await api.get<ReportsResponse>("/reports", { params });

    return data.data;
  },

  async exportExcel(params: ReportFilters = {}): Promise<AxiosResponse<Blob>> {
    return api.get<Blob>("/reports/export/excel", {
      params,
      responseType: "blob",
      timeout: 120000,
    });
  },

  async exportPdf(params: ReportFilters = {}): Promise<AxiosResponse<Blob>> {
    return api.get<Blob>("/reports/export/pdf", {
      params,
      responseType: "blob",
      timeout: 120000,
    });
  },
};
