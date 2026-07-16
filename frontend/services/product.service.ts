import api from "@/lib/axios";
import { AxiosProgressEvent } from "axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "@/types/pagination";
import { Product, ProductPayload } from "@/types/product";

export interface ProductParams {
  page?: number;
  per_page?: number;
  search?: string;
  plant?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface ProductResponse {
  message: string;
  data: Product;
}

export interface ImportProductError {
  row: number;
  asset: string;
  messages: string[];
}

export interface ImportProductSummary {
  total_rows: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
}

export interface ImportProductResponse {
  message: string;
  summary: ImportProductSummary;
  errors: ImportProductError[];
}

export const ProductService = {
  async getProducts(params: ProductParams = {}) {
    const { data } = await api.get<PaginatedResponse<Product>>("/products", {
      params,
    });

    return data;
  },

  async getProduct(id: number) {
    const { data } = await api.get<ProductResponse>(`/products/${id}`);

    return data.data;
  },

  async createProduct(payload: ProductPayload) {
    const { data } = await api.post<ProductResponse>("/products", payload);

    return data;
  },

  async updateProduct(id: number, payload: Partial<ProductPayload>) {
    const { data } = await api.put<ProductResponse>(`/products/${id}`, payload);

    return data;
  },

  async deleteProduct(id: number) {
    const { data } = await api.delete<{ message: string }>(`/products/${id}`);

    return data;
  },

  async importProducts(file: File, onUploadProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<ImportProductResponse>("/products/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (!event.total || !onUploadProgress) {
          return;
        }

        const progress = Math.round((event.loaded / event.total) * 100);
        onUploadProgress(progress);
      },
    });

    return data;
  },

  async exportTemplateExcel(): Promise<AxiosResponse<Blob>> {
    return api.get<Blob>("/products/export/template", {
      responseType: "blob",
      timeout: 120000,
    });
  },

  async exportProductsExcel(params: ProductParams = {}): Promise<AxiosResponse<Blob>> {
    return api.get<Blob>("/products/export/excel", {
      params,
      responseType: "blob",
      timeout: 120000,
    });
  },

  async exportProductsPdf(params: ProductParams = {}): Promise<AxiosResponse<Blob>> {
    return api.get<Blob>("/products/export/pdf", {
      params,
      responseType: "blob",
      timeout: 120000,
    });
  },
};
