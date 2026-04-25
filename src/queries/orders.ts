import axios, { AxiosError } from "axios";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import API_PATHS from "~/constants/apiPaths";
import { OrderStatus } from "~/constants/order";
import { Order } from "~/models/Order";

export function useOrders() {
  return useQuery<Order[], AxiosError>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axios.get<Order[]>(`${API_PATHS.order}/order`);
      return res.data;
    },
  });
}

export function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["orders"],
      exact: true,
    });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: (values: {
      id: string;
      status: OrderStatus;
      comment: string;
    }) => {
      const { id, ...data } = values;
      return axios.put(`${API_PATHS.order}/order/${id}/status`, data, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
      });
    },
  });
}

export function useSubmitOrder() {
  return useMutation({
    mutationFn: (values: Omit<Order, "id">) => {
      return axios.put(`${API_PATHS.order}/order`, values, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
      });
    },
  });
}

export function useInvalidateOrder() {
  const queryClient = useQueryClient();
  return (id: string) =>
    queryClient.invalidateQueries({
      queryKey: ["order", { id }],
      exact: true,
    });
}

export function useDeleteOrder() {
  return useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${API_PATHS.order}/order/${id}`, {
        headers: {
          Authorization: `Basic ${localStorage.getItem(
            "authorization_token"
          )}`,
        },
      }),
  });
}