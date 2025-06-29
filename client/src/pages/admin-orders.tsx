import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import AdminSidebar from "@/components/admin-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePagination } from "@/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Eye,
  Calendar,
  DollarSign,
  Package,
  User,
  CreditCard,
  TrendingUp,
  Clock
} from "lucide-react";

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/login");
    }
  }, [setLocation]);

  // Helper to make authenticated requests
  const authenticatedRequest = async (method: string, url: string, data?: any) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("admin_token");
      setLocation("/login");
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    return response.status === 204 ? null : response.json();
  };

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch("/api/orders", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_token");
        setLocation("/login");
        throw new Error("Authentication failed");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
      }

      return response.json();
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return authenticatedRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Success", description: "Order status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  // Calculate order statistics
  const orderStats = {
    total: Array.isArray(orders) ? orders.length : 0,
    pending: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'pending').length : 0,
    completed: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'completed').length : 0,
    cancelled: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'cancelled').length : 0,
    totalRevenue: Array.isArray(orders) ? orders
      .filter((o: any) => o.status === 'completed')
      .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || '0'), 0) : 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedOrders,
    goToPage,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    startItem,
    endItem,
    totalItems,
  } = usePagination({ data: orders, itemsPerPage: 10 });
  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Orders</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
                  </div>
                  <Package className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${orderStats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Orders ({orderStats.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${parseFloat(order.totalAmount || '0').toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {order.paymentMethod || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(status) => handleStatusChange(order.id, status)}
                          >
                            <SelectTrigger className="w-auto min-w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {Array.isArray(orders) && orders.length === 0 && !loadingOrders && (
                <div className="text-center py-8 text-gray-500">
                  No orders found. Orders will appear here when customers make purchases.
                </div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {startItem} to {endItem} of {totalItems} artists
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={previousPage}
                          className={hasPrevious ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => goToPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={nextPage}
                          className={hasNext ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Customer Information</h4>
                    <div className="mt-2">
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                      {selectedOrder.customerAddress && (
                        <p className="text-sm text-gray-500 mt-1">{selectedOrder.customerAddress}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Order Information</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Payment:</span>
                        <span className="text-sm">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total:</span>
                        <span className="font-medium">${parseFloat(selectedOrder.totalAmount || '0').toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{item.artwork?.title || 'Unknown Artwork'}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                          </div>
                          <span className="font-medium">${parseFloat(item.price || '0').toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  );
}