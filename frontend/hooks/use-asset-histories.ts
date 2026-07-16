import { useQuery } from "@tanstack/react-query";

import { AssetHistoryService } from "@/services/asset-history.service";
import { AssetHistoryParams } from "@/types/asset-history";

export const assetHistoryKeys = {
  all: ["asset-histories"] as const,
  lists: () => [...assetHistoryKeys.all, "list"] as const,
  list: (params: AssetHistoryParams) => [...assetHistoryKeys.lists(), params] as const,
  details: () => [...assetHistoryKeys.all, "detail"] as const,
  detail: (id: number) => [...assetHistoryKeys.details(), id] as const,
  users: () => [...assetHistoryKeys.all, "users"] as const,
};

export function useAssetHistories(params: AssetHistoryParams) {
  return useQuery({
    queryKey: assetHistoryKeys.list(params),
    queryFn: () => AssetHistoryService.getHistories(params),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData,
  });
}

export function useAssetHistory(id: number, enabled = true) {
  return useQuery({
    queryKey: assetHistoryKeys.detail(id),
    queryFn: () => AssetHistoryService.getHistory(id),
    enabled,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAssetHistoryUsers() {
  return useQuery({
    queryKey: assetHistoryKeys.users(),
    queryFn: () => AssetHistoryService.getUsers(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
