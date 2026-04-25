

          import axios, { AxiosError } from "axios";
          import API_PATHS from "~/constants/apiPaths";
          import { AvailableProduct } from "~/models/Product";
          import {
            useQuery,
            useQueryClient,
            useMutation,
          } from "@tanstack/react-query";
          import React from "react";

          export function useAvailableProducts() {
            return useQuery<AvailableProduct[], AxiosError>({
              queryKey: ["available-products"],
              queryFn: async () => {
                const res = await axios.get<AvailableProduct[]>(
                  "https://lei6xl1rif.execute-api.us-east-1.amazonaws.com/prod/products"
                );
                return res.data;
              },
            });
          }

          export function useInvalidateAvailableProducts() {
            const queryClient = useQueryClient();

            return React.useCallback(() => {
              queryClient.invalidateQueries({
                queryKey: ["available-products"],
                exact: true,
              });
            }, [queryClient]);
          }

          export function useAvailableProduct(id?: string) {
            return useQuery<AvailableProduct, AxiosError>({
              queryKey: ["product", { id }],
              queryFn: async () => {
                const res = await axios.get<AvailableProduct>(
                  `${API_PATHS.bff}/product/${id}`
                );
                return res.data;
              },
              enabled: !!id,
            });
          }

          export function useRemoveProductCache() {
            const queryClient = useQueryClient();

            return React.useCallback(
                (id?: string) => {
                queryClient.removeQueries({
                    queryKey: ["product", { id }],
                  exact: true,
                });
              },
              [queryClient]
            );
          }

          export function useUpsertAvailableProduct() {
            const queryClient = useQueryClient();

            return useMutation({
              mutationFn: (values: AvailableProduct) =>
                axios.put<AvailableProduct>(
                  `${API_PATHS.bff}/product`,
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
                  queryKey: ["available-products"],
                });
              },
            });
          }

          export function useDeleteAvailableProduct() {
            const queryClient = useQueryClient();

            return useMutation({
              mutationFn: (id: string) =>
                axios.delete(`${API_PATHS.bff}/product/${id}`, {
                  headers: {
                    Authorization: `Basic ${localStorage.getItem(
                      "authorization_token"
                    )}`,
                  },
                }),
              onSuccess: () => {
                queryClient.invalidateQueries({
                  queryKey: ["available-products"],
                });
              },
            });
          }