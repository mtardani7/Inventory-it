import api from "@/lib/api";
import { PaginatedResponse } from "@/types/pagination";
import { Product, ProductPayload } from "@/types/product";

export interface ProductParams {
  page?: number;
  per_page?: number;
  search?: string;
  plant?: string;
  status?: string;
}

export interface ProductResponse {
  message: string;
  data: Product;
}

export const ProductService = {
  async getProducts(params: ProductParams = {}) {
    const { data } = await api.get<PaginatedResponse<Product>>("/products", {
      params,
    });

    return data;
  },

  async getProduct(id: number) {
    const { data } = await api.get<Product>(`/products/${id}`);

    return data;
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
};
