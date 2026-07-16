export interface Setting {
  id: number;
  company_name: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_logo: string | null;
  company_logo_url: string | null;
  default_language: "id" | "en";
  default_theme: "light" | "dark" | "system";
  created_at: string | null;
  updated_at: string | null;
}

export interface SettingResponse {
  message: string;
  data: Setting;
}

export interface SettingPayload {
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_logo?: File | null;
  default_language?: "id" | "en";
  default_theme?: "light" | "dark" | "system";
}
