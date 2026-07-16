import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authService, { LoginRequest } from "@/services/auth.service";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}