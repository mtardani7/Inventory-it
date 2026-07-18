import { useMutation, useQuery } from "@tanstack/react-query";

import { ReportService } from "@/services/report.service";
import { ReportFilters } from "@/types/report";

export const reportKeys = {
  all: ["reports"] as const,
  list: (params: ReportFilters) => [...reportKeys.all, params] as const,
};

export function useReports(params: ReportFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => ReportService.getReports(params),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData,
  });
}

export function useExportReportExcel() {
  return useMutation({
    mutationFn: (params: ReportFilters) => ReportService.exportExcel(params),
  });
}

export function useExportReportPdf() {
  return useMutation({
    mutationFn: (params: ReportFilters) => ReportService.exportPdf(params),
  });
}
