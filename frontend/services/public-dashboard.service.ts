import api from "@/lib/axios";
import { PublicDashboardResponse } from "@/types/public-dashboard";

export const PublicDashboardService = {
  async getDashboard() {
    const { data } = await api.get<PublicDashboardResponse>("/public/dashboard");

    return data.data;
  },
};