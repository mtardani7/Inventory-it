import api from "@/lib/axios";
import { SettingPayload, SettingResponse } from "@/types/setting";

export const SettingService = {
  async getSetting() {
    const { data } = await api.get<SettingResponse>("/settings");

    return data.data;
  },

  async saveSetting(payload: SettingPayload) {
    const formData = new FormData();

    const textFields: Array<keyof Omit<SettingPayload, "company_logo">> = [
      "company_name",
      "company_address",
      "company_phone",
      "company_email",
      "default_language",
      "default_theme",
    ];

    textFields.forEach((field) => {
      const value = payload[field];
      if (typeof value === "string") {
        formData.append(field, value);
      }
    });

    if (payload.company_logo instanceof File) {
      formData.append("company_logo", payload.company_logo);
    }

    const { data } = await api.post<SettingResponse>("/settings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    });

    return data.data;
  },

  async deleteSetting() {
    const { data } = await api.delete<{ message: string }>("/settings");

    return data;
  },
};
