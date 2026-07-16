import api from "@/lib/axios";
import { PaginatedResponse } from "@/types/pagination";
import {
  AssetHistory,
  AssetHistoryDetailResponse,
  AssetHistoryParams,
  AssetHistoryUsersResponse,
} from "@/types/asset-history";

export const AssetHistoryService = {
  async getHistories(params: AssetHistoryParams = {}) {
    const { data } = await api.get<PaginatedResponse<AssetHistory>>("/asset-histories", {
      params,
    });

    return data;
  },

  async getHistory(id: number) {
    const { data } = await api.get<AssetHistoryDetailResponse>(`/asset-histories/${id}`);

    return data.data;
  },

  async getUsers() {
    const { data } = await api.get<AssetHistoryUsersResponse>("/asset-histories/users");

    return data.data;
  },
};
