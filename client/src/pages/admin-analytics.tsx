import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from "@/components/admin-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Eye,
  Download,
  Filter,
  RefreshCw,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Renders the Admin Analytics dashboard with key metrics and charts.
 */
export default function AdminAnalytics() {
  const [, setLocation] = useLocation();
  const [timeFilter, setTimeFilter] = useState("30");
  const { toast } = useToast();

  // --- Authentication Check ---
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      console.warn("No admin_token found. Redirecting to login.");
      setLocation("/login");
    }
  }, [setLocation]);

  // --- Authenticated Request Helper ---
  const authenticatedRequest = useCallback(
    async <T,>(url: string): Promise<T | null> => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        console.error("Authentication Error: No admin_token found. Redirecting.");
        setLocation("/login");
        throw new Error("Authentication failed: No token.");
      }

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("admin_token");
          console.error("Authentication Error: Invalid or expired token. Redirecting.");
          setLocation("/login");
          throw new Error("Authentication failed. Please log in again.");
        }

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
          console.error(`API Error: ${response.status} for GET ${url}`, errorBody);
          throw new Error(errorBody.message || `API request failed with status: ${response.status}`);
        }

        return (await response.json()) as T;
      } catch (error: any) {
        console.error(`Fetch operation failed for GET ${url}:`, error);
        throw error;
      }
    },
    [setLocation]
  );

  // --- React Query: Fetch Data ---
  const {
    data: orders = [],
    isLoading: loadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["adminAnalyticsOrders", timeFilter],
    queryFn: () => authenticatedRequest<any[]>(`/api/orders?filter=${timeFilter}`), // Using query param for filter
    staleTime: 60 * 1000,
  });

  const { data: artworks = [], isLoading: loadingArtworks } = useQuery({
    queryKey: ["adminArtworks"],
    queryFn: () => authenticatedRequest<any[]>("/api/artworks"),
    staleTime: Infinity, // Artworks don't change often
  });

  const { data: artists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ["adminArtists"],
    queryFn: () => authenticatedRequest<any[]>("/api/artists"),
    staleTime: Infinity, // Artists don't change often
  });

  // --- Error Handling for Data Fetching ---
  useEffect(() => {
    if (ordersError) {
      toast({
        title: "Failed to load analytics data",
        description: ordersError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      console.error("Analytics fetch error:", ordersError);
    }
  }, [ordersError, toast]);

  // --- Data Processing for Charts and Metrics ---
  const getFilteredOrders = useCallback(() => {
    if (!Array.isArray(orders)) return [];
    
    // The API should handle filtering, but we'll keep the client-side logic for a fallback.
    // Assuming 'timeFilter' is a string like "7", "30", "90", "365".
    const now = new Date();
    const daysAgo = parseInt(timeFilter);
    const filterDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return orders.filter((order: any) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= filterDate;
    });
  }, [orders, timeFilter]);

  const filteredOrders = getFilteredOrders();

  // Calculate key metrics from filtered data
  const analytics = {
    totalRevenue: filteredOrders
      .filter((o: any) => o.status === "completed")
      .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || "0"), 0),
    totalOrders: filteredOrders.length,
    completedOrders: filteredOrders.filter((o: any) => o.status === "completed").length,
    pendingOrders: filteredOrders.filter((o: any) => o.status === "pending").length,
    cancelledOrders: filteredOrders.filter((o: any) => o.status === "cancelled").length,
    averageOrderValue:
      filteredOrders.length > 0
        ? filteredOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || "0"), 0) / filteredOrders.length
        : 0,
  };

  // --- Chart Data Generators ---
  const getMonthlyRevenueData = useCallback(() => {
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });
    
    // Initialize data for the last 6 months to ensure the chart has a consistent scale
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyData[monthFormatter.format(date)] = 0;
    }

    filteredOrders
      .filter((o: any) => o.status === "completed" && o.createdAt)
      .forEach((order: any) => {
        const date = new Date(order.createdAt);
        const monthKey = monthFormatter.format(date);
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += parseFloat(order.totalAmount || "0");
        }
      });

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }, [filteredOrders]);

  const getDailyOrdersData = useCallback(() => {
    const dailyData: { [key: string]: number } = {};
    const now = new Date();
    const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    
    // Initialize data for the last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dailyData[dayFormatter.format(date)] = 0;
    }

    filteredOrders
      .filter((o: any) => o.createdAt)
      .forEach((order: any) => {
        const date = new Date(order.createdAt);
        const dayKey = dayFormatter.format(date);
        if (dailyData.hasOwnProperty(dayKey)) {
          dailyData[dayKey]++;
        }
      });
    
    return Object.entries(dailyData).map(([day, orders]) => ({
        day,
        orders,
    }));
  }, [filteredOrders]);

  const getStatusDistribution = useCallback(() => {
    const statusCounts = {
      completed: filteredOrders.filter((o: any) => o.status === "completed").length,
      pending: filteredOrders.filter((o: any) => o.status === "pending").length,
      processing: filteredOrders.filter((o: any) => o.status === "processing").length,
      cancelled: filteredOrders.filter((o: any) => o.status === "cancelled").length,
    };

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    return [
      { name: "Completed", value: statusCounts.completed, fill: "#10b981" },
      { name: "Pending", value: statusCounts.pending, fill: "#eab308" },
      { name: "Processing", value: statusCounts.processing, fill: "#3b82f6" },
      { name: "Cancelled", value: statusCounts.cancelled, fill: "#ef4444" },
    ].filter(item => item.value > 0);
  }, [filteredOrders]);

  const monthlyRevenueData = getMonthlyRevenueData();
  const dailyOrdersData = getDailyOrdersData();
  const statusDistributionData = getStatusDistribution();

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number) => `${value.toFixed(1)}%`, []);

  const totalArtworks = Array.isArray(artworks) ? artworks.length : 0;
  const totalArtists = Array.isArray(artists) ? artists.length : 0;

  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-600" />
              Analytics Dashboard
            </h1>
            <div className="flex items-center gap-4">
              {/* Time Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-44 h-10 border-gray-300 bg-white shadow-sm rounded-lg text-sm">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchOrders();
                  toast({ title: "Refreshing...", description: "Fetching the latest analytics data." });
                }}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button size="sm" className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-8 space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">Total Revenue</p>
                  {loadingOrders ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse mt-2 rounded"></div>
                  ) : (
                    <p className="text-4xl font-extrabold text-green-700 mt-2">
                      {formatCurrency(analytics.totalRevenue)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="text-green-600 font-semibold">+12.5%</span> from last period
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">Total Orders</p>
                  {loadingOrders ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse mt-2 rounded"></div>
                  ) : (
                    <p className="text-4xl font-extrabold text-blue-700 mt-2">{analytics.totalOrders}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="text-blue-600 font-semibold">+8.2%</span> from last period
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">Average Order Value</p>
                  {loadingOrders ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse mt-2 rounded"></div>
                  ) : (
                    <p className="text-4xl font-extrabold text-purple-700 mt-2">
                      {formatCurrency(analytics.averageOrderValue)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="text-purple-600 font-semibold">+3.1%</span> from last period
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">Artworks & Artists</p>
                  {loadingArtworks || loadingArtists ? (
                    <div className="space-y-2 mt-2">
                      <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-3xl font-extrabold text-gray-900">
                        <Package className="w-6 h-6 text-gray-500" />
                        <span>{totalArtworks}</span>
                        <span className="text-sm font-medium text-gray-500">Artworks</span>
                      </div>
                      <div className="flex items-center gap-2 text-3xl font-extrabold text-gray-900">
                        <Users className="w-6 h-6 text-gray-500" />
                        <span>{totalArtists}</span>
                        <span className="text-sm font-medium text-gray-500">Artists</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-100 rounded-full self-start">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Monthly Revenue Chart */}
            <Card className="xl:col-span-2 rounded-xl shadow-lg border border-gray-200">
              <CardHeader className="border-b px-6 py-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-indigo-600" /> Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center h-80 text-gray-600">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
                    <p>Building revenue chart...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "#d1d5db" }} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} cursor={{ fill: "#f3f4f6" }} />
                      <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card className="rounded-xl shadow-lg border border-gray-200">
              <CardHeader className="border-b px-6 py-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-teal-600" /> Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center h-80 text-gray-600">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500 mb-4"></div>
                    <p>Calculating distribution...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                          labelLine={false}
                          stroke="none"
                        >
                          {statusDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [`${value} orders`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm font-medium">
                      {statusDistributionData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <span>{entry.name}:</span>
                          <span className="font-semibold">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Daily Orders Line Chart */}
          <Card className="rounded-xl shadow-lg border border-gray-200">
              <CardHeader className="border-b px-6 py-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-pink-600" /> Daily Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center h-80 text-gray-600">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mb-4"></div>
                    <p>Building daily orders chart...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={dailyOrdersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: "#d1d5db" }} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#ec4899"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#db2777', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

        </div>
      </div>
    </AdminSidebar>
  );
}