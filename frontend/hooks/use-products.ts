import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProductParams, ProductService } from "@/services/product.service";
import { ProductPayload } from "@/types/product";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export function useProducts(params: ProductParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => ProductService.getProducts(params),
  });
}

export function useProduct(id: number, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => ProductService.getProduct(id),
    enabled,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) =>
      ProductService.createProduct(payload),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ProductPayload>;
    }) => ProductService.updateProduct(id, payload),
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
      queryClient.setQueryData(productKeys.detail(response.data.id), response.data);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
}

export function useDisposeProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ProductPayload>;
    }) =>
      ProductService.updateProduct(id, {
        ...payload,
        status: "Disposal",
      }),
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
      queryClient.setQueryData(productKeys.detail(response.data.id), response.data);
    },
  });
}
