import { Link } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import {
  useDeleteOrder,
  useInvalidateOrders,
  useOrders,
} from "~/queries/orders";

export default function Orders() {
  const { data = [], isLoading } = useOrders();
  const invalidateOrders = useInvalidateOrders();
  const { mutate: deleteOrder, isPending } = useDeleteOrder();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="orders table">
        <TableHead>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell align="right">Items count</TableCell>
            <TableCell align="right">Address</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                {order.address?.firstName} {order.address?.lastName}
              </TableCell>

              <TableCell align="right">
                {order.items?.length || 0}
              </TableCell>

              <TableCell align="right">
                {order.address?.address}
              </TableCell>

              <TableCell align="right">
                {
                  order.statusHistory[
                    order.statusHistory.length - 1
                  ]?.status
                }
              </TableCell>

              <TableCell align="right">
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={order.id}
                >
                  Manage
                </Button>

                <Button
                  size="small"
                  color="secondary"
                  disabled={isPending}
                  onClick={() =>
                    deleteOrder(order.id, {
                      onSuccess: () => invalidateOrders(),
                    })
                  }
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}