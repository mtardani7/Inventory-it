import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SettingService } from "@/services/setting.service";
import { SettingPayload } from "@/types/setting";

export const settingKeys = {
  all: ["setting"] as const,
};

export function useSetting() {
  return useQuery({
    queryKey: settingKeys.all,
    queryFn: () => SettingService.getSetting(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useSaveSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SettingPayload) => SettingService.saveSetting(payload),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: settingKeys.all,
      });
    },
  });
}
