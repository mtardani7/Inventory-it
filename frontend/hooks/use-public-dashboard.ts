import { useQuery } from "@tanstack/react-query";

import { PublicDashboardService } from "@/services/public-dashboard.service";

export const publicDashboardKeys = {
  all: ["public-dashboard"] as const,
};

export function usePublicDashboard() {
  return useQuery({
    queryKey: publicDashboardKeys.all,
    queryFn: () => PublicDashboardService.getDashboard(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}