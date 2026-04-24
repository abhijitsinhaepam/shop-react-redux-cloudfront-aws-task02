import axios, { AxiosError } from "axios";
import React from "react";
import {
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";

export function useCart() {
  return useQuery<CartItem[], AxiosError>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axios.get<CartItem[]>(
        `${API_PATHS.cart}/profile/cart`,
        {
          headers: {
            Authorization: `Basic ${localStorage.getItem(
              "authorization_token"
            )}`,
          },
        }
      );
      return res.data;
    },
  });
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>(["cart"]);
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();

  return React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["cart"],
      exact: true,
    });
  }, [queryClient]);
}

export function useUpsertCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CartItem) =>
      axios.put<CartItem[]>(
        `${API_PATHS.cart}/profile/cart`,
        values,
        {
          headers: {
            Authorization: `Basic ${localStorage.getItem(
              "authorization_token"
            )}`,
          },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}