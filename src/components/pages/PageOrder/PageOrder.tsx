import React from "react";
import { Order, OrderItem } from "~/models/Order";
import axios from "axios";
import { useParams } from "react-router-dom";
import PaperLayout from "~/components/PaperLayout/PaperLayout";
import Typography from "@mui/material/Typography";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";
import { AvailableProduct } from "~/models/Product";
import ReviewOrder from "~/components/pages/PageCart/components/ReviewOrder";
import { OrderStatus, ORDER_STATUS_FLOW } from "~/constants/order";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { Field, Form, Formik, FormikProps } from "formik";
import Grid from "@mui/material/Grid";
import TextField from "~/components/Form/TextField";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Box from "@mui/material/Box";
import { useQueries } from "react-query";
import { useInvalidateOrder, useUpdateOrderStatus } from "~/queries/orders";

type FormValues = {
  status: OrderStatus;
  comment: string;
};

export default function PageOrder() {
  const { id } = useParams<{ id: string }>();
  const results = useQueries([
    {
      queryKey: ["order", { id }],
      queryFn: async () => {
        const res = await axios.get<Order>(`${API_PATHS.order}/order/${id}`);
        return res.data;
      },
    },
    {
      queryKey: "products",
      queryFn: async () => {
        const res = await axios.get<AvailableProduct[]>(
          `${API_PATHS.bff}/product/available`
        );
        return res.data;
      },
    },
  ]);
  const [
    { data: order, isLoading: isOrderLoading },
    { data: products, isLoading: isProductsLoading },
  ] = results;
  const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();
  const invalidateOrder = useInvalidateOrder();
  
  const cartItems: CartItem[] = React.useMemo(() => {
    if (order && products) {
      return order.items.map((item: OrderItem) => {
        const product = products.find((p) => p.id === item.productId);
        // BUG 1: Removed the error guard logic. If a product is deleted/missing, 
        // it will pass undefined into the array and crash the UI down the line.
        // FIX 1: Reintroduce the error guard.
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found for order item.`);
        }
        return { product, count: item.count };
      });
    }
    return [];
    // BUG 2: Emptied the dependency array. 
    // This will cause cartItems to memoize an empty array on mount and never recalculate when data loads.
    // FIX 2: Restore correct dependencies.
  }, [order, products]);

  if (isOrderLoading || isProductsLoading) return <p>loading...</p>;

  const statusHistory = order?.statusHistory || [];

  // BUG 3: Attempting to access status directly without checking if the history array is empty. 
  // If an order has no history yet, this will throw a TypeError: Cannot read properties of undefined.
  // FIX 3: Add a check for statusHistory.length.
  const lastStatusItem = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] : null;

  return order ? (
    <PaperLayout>
      <Typography component="h1" variant="h4" align="center">
        Manage order
      </Typography>
      <ReviewOrder address={order.address} items={cartItems} />
      <Typography variant="h6">Status:</Typography>
      <Typography variant="h6" color="primary">
        {/* FIX 3 continued: Handle lastStatusItem being null */}
        {lastStatusItem?.status.toUpperCase() || OrderStatus.Pending.toUpperCase()}
      </Typography>
      <Typography variant="h6">Change status:</Typography>
      <Box py={2}>
        <Formik
          // FIX 3 continued: Handle lastStatusItem being null for initialValues
          initialValues={{ status: lastStatusItem?.status || OrderStatus.Pending, comment: "" }}
          enableReinitialize
          onSubmit={(values) =>
            updateOrderStatus(
              { id: order.id, ...values },
              { onSuccess: () => invalidateOrder(order.id) }
            )
          }
        >
          {({ values, dirty, isSubmitting }: FormikProps<FormValues>) => (
            <Form autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    component={TextField}
                    name="status"
                    label="Status"
                    select
                    fullWidth
                    helperText={
                      values.status === OrderStatus.Approved
                        ? "Setting status to APPROVED will decrease products count from stock"
                        : undefined
                    }
                  >
                    {ORDER_STATUS_FLOW.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field
                    component={TextField}
                    name="comment"
                    label="Comment"
                    fullWidth
                    autoComplete="off"
                    multiline
                  />
                </Grid>
                <Grid item container xs={12} justifyContent="space-between">
                  {/* BUG 4: Accidentally left disabled={true} hardcoded. 
                      Users will never be able to submit status changes. */}
                  {/* FIX 4: Revert disabled prop to original conditional logic. */}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!dirty || isSubmitting}
                  >
                    Change status
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
      <Typography variant="h6">Status history:</Typography>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell align="right">Date and Time</TableCell>
              <TableCell align="right">Comment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statusHistory.map((statusHistoryItem, index) => ( // Added index for fallback key
              // BUG 5: Duplicate React keys. Using order.id instead of statusHistoryItem's individual ID 
              // or timestamp will trigger console warnings and mess up table rendering updates.
              // FIX 5: Use a unique key for each statusHistoryItem.
              <TableRow key={statusHistoryItem.timestamp || index}>
                <TableCell component="th" scope="row">
                  {statusHistoryItem.status.toUpperCase()}
                </TableCell>
                <TableCell align="right">
                  {new Date(statusHistoryItem.timestamp).toString()}
                </TableCell>
                <TableCell align="right">{statusHistoryItem.comment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PaperLayout>
  ) : null;
}
