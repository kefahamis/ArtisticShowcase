import { useState, useEffect, useCallback } from "react";
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
  Clock,
  RefreshCw,
  FileText,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // --- Authentication Check ---
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      console.warn("No admin_token found. Redirecting to login.");
      setLocation("/login");
    }
  }, [setLocation]);

  // --- Authenticated Request Helper with Debugging Logs ---
  const authenticatedRequest = useCallback(
    async <T,>(method: string, url: string, data?: any): Promise<T | null> => {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        console.error("Authentication Error: No admin_token found. Redirecting.");
        setLocation("/login");
        throw new Error("Authentication failed: No token.");
      }

      console.log(`[Request] ${method} ${url}`);
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        console.log(`[Response] ${method} ${url} - Status: ${response.status}`);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("admin_token");
          console.error(`Authentication Error: ${response.status} - Invalid or expired token. Redirecting.`);
          setLocation("/login");
          throw new Error("Authentication failed. Please log in again.");
        }

        if (!response.ok && response.status !== 304) {
          const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
          console.error(`API Error: ${response.status} for ${method} ${url}`, errorBody);
          throw new Error(errorBody.message || `API request failed with status: ${response.status}`);
        }

        if (response.status === 204 || response.status === 304) {
          return null;
        }

        return (await response.json()) as T;
      } catch (error: any) {
        console.error(`Fetch operation failed for ${method} ${url}:`, error);
        throw error;
      }
    },
    [setLocation]
  );

  // --- React Query: Fetch Orders ---
  const {
    data: orders = [],
    isLoading: loadingOrders,
    error: fetchError,
    refetch: refetchOrders, // Expose refetch function for the manual refresh button
  } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => authenticatedRequest<any[]>("GET", "/api/orders"),
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // --- Error Handling for Fetching Orders ---
  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Failed to load orders",
        description: fetchError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      console.error("Orders fetch error:", fetchError);
    }
  }, [fetchError, toast]);

  // --- Update order status mutation ---
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => {
      return authenticatedRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      // Invalidate the cache to force React Query to re-fetch the data from the server
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast({ title: "Success", description: "Order status updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    },
  });

  const handleStatusChange = useCallback(
    (orderId: number, status: string) => {
      updateOrderStatusMutation.mutate({ orderId, status });
    },
    [updateOrderStatusMutation]
  );

  const viewOrderDetails = useCallback((order: any) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  }, []);

  // --- Calculate order statistics ---
  const orderStats = {
    total: Array.isArray(orders) ? orders.length : 0,
    pending: Array.isArray(orders) ? orders.filter((o: any) => o.status === "pending").length : 0,
    completed: Array.isArray(orders) ? orders.filter((o: any) => o.status === "completed").length : 0,
    cancelled: Array.isArray(orders) ? orders.filter((o: any) => o.status === "cancelled").length : 0,
    totalRevenue: Array.isArray(orders)
      ? orders
          .filter((o: any) => o.status === "completed")
          .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || "0"), 0)
      : 0,
  };

  // --- Helper functions for rendering ---
  const getStatusBadge = useCallback((status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };
    const { label, className } = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={`font-semibold capitalize px-3 py-1 text-xs rounded-full ${className}`}>{label}</Badge>;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // --- Pagination Logic ---
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

  // --- Rendered Component ---
  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Orders Management</h1>
            <Button
              variant="outline"
              onClick={() => {
                refetchOrders();
                toast({ title: "Refreshing...", description: "Fetching the latest orders from the server." });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh List
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6 space-y-6">
          {/* Order Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="rounded-lg shadow-md border-l-4 border-blue-600">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{orderStats.total}</p>
                </div>
                <ShoppingCart className="w-10 h-10 text-blue-500 opacity-20" />
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-md border-l-4 border-yellow-500">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{orderStats.pending}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-md border-l-4 border-green-600">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">{orderStats.completed}</p>
                </div>
                <Package className="w-10 h-10 text-green-600 opacity-20" />
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-md border-l-4 border-purple-600">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-700 mt-1">
                    ${orderStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card className="shadow-lg rounded-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <FileText className="w-6 h-6 text-blue-600" />
                Order List <span className="text-gray-500 text-lg">({totalItems})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                  <p>Loading orders...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[100px] text-gray-600 font-semibold text-sm">Order ID</TableHead>
                        <TableHead className="text-gray-600 font-semibold text-sm">Customer</TableHead>
                        <TableHead className="w-[150px] text-gray-600 font-semibold text-sm">Date</TableHead>
                        <TableHead className="w-[120px] text-gray-600 font-semibold text-sm">Amount</TableHead>
                        <TableHead className="w-[150px] text-gray-600 font-semibold text-sm">Payment</TableHead>
                        <TableHead className="w-[150px] text-gray-600 font-semibold text-sm">Status</TableHead>
                        <TableHead className="w-[80px] text-right text-gray-600 font-semibold text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order: any) => (
                          <TableRow key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <TableCell className="font-medium text-gray-900">#{order.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <div className="font-medium">{order.customerName}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">{formatDate(order.createdAt)}</TableCell>
                            <TableCell className="font-semibold text-gray-800">
                              ${parseFloat(order.totalAmount || "0").toFixed(2)}
                            </TableCell>
                            <TableCell className="text-gray-700 text-sm flex items-center gap-1">
                              <CreditCard className="w-4 h-4 text-gray-500" />
                              {order.paymentMethod || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(status) => handleStatusChange(order.id, status)}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-auto min-w-[120px] h-9 text-sm">
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
                                className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 p-2"
                                aria-label="View order details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-gray-500 italic">
                            No orders found. Orders will appear here when customers make purchases.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{startItem}</span> to <span className="font-semibold">{endItem}</span> of <span className="font-semibold">{totalItems}</span> orders
                  </div>
                  <Pagination>
                    <PaginationContent className="flex items-center space-x-2">
                      <PaginationItem>
                        <PaginationPrevious onClick={previousPage} className={hasPrevious ? "cursor-pointer text-blue-600 hover:bg-blue-50" : "cursor-not-allowed opacity-50 text-gray-400"} />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink onClick={() => goToPage(page)} isActive={currentPage === page} className={`cursor-pointer px-3 py-1 rounded-md transition-colors duration-200 ${currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext onClick={nextPage} className={hasNext ? "cursor-pointer text-blue-600 hover:bg-blue-50" : "cursor-not-allowed opacity-50 text-gray-400"} />
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
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-lg shadow-xl z-[1000]">
            <DialogHeader className="pb-4 border-b border-gray-200 mb-4">
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                Order Details <span className="text-gray-500 font-normal">#{selectedOrder?.id}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Information */}
                <Card className="col-span-1 rounded-lg border border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-3 p-4 border-b">
                    <User className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Customer Info</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedOrder.customerEmail}</span>
                    </div>
                    {selectedOrder.customerAddress && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                        <address className="not-italic leading-relaxed">{selectedOrder.customerAddress}</address>
                      </div>
                    )}
                    {selectedOrder.customerPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedOrder.customerPhone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="col-span-1 rounded-lg border border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-3 p-4 border-b">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-800">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-gray-800">{selectedOrder.paymentMethod || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                      <span className="font-semibold text-gray-700">Total Amount:</span>
                      <span className="font-bold text-lg text-green-700">
                        ${parseFloat(selectedOrder.totalAmount || "0").toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                {/* Order Items */}
                <Card className="col-span-1 md:col-span-3 rounded-lg border border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-3 p-4 border-b">
                    <Package className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-lg font-semibold text-gray-800">Items ({selectedOrder.items?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between border-b last:border-b-0 py-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.artwork?.imageUrl || "https://placehold.co/60x60/e2e8f0/000000?text=IMG"}
                              alt={item.artwork?.title}
                              className="w-12 h-12 rounded-md object-cover border border-gray-200 flex-shrink-0"
                            />
                            <div>
                              <p className="font-medium text-gray-800">{item.artwork?.title || "Unknown Artwork"}</p>
                              <p className="text-sm text-gray-500">
                                Quantity: <span className="font-semibold">{item.quantity || 1}</span>
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-800">
                            ${parseFloat(item.price || "0").toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 italic py-4">No items found for this order.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  );
}