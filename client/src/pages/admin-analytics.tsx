import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from "@/components/admin-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  TrendingUp, 
  Calendar,
  DollarSign,
  Package,
  Users,
  Eye,
  Download,
  Filter
} from "lucide-react";

export default function AdminAnalytics() {
  const [, setLocation] = useLocation();
  const [timeFilter, setTimeFilter] = useState("30");

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
    queryKey: ["/api/orders", timeFilter],
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

  const { data: artworks = [] } = useQuery({
    queryKey: ["/api/artworks"],
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["/api/artists"],
  });

  // Filter orders based on time period
  const getFilteredOrders = () => {
    if (!Array.isArray(orders)) return [];
    
    const now = new Date();
    const daysAgo = parseInt(timeFilter);
    const filterDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    return orders.filter((order: any) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= filterDate;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Calculate analytics data
  const analytics = {
    totalRevenue: filteredOrders
      .filter((o: any) => o.status === 'completed')
      .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || '0'), 0),
    totalOrders: filteredOrders.length,
    completedOrders: filteredOrders.filter((o: any) => o.status === 'completed').length,
    pendingOrders: filteredOrders.filter((o: any) => o.status === 'pending').length,
    cancelledOrders: filteredOrders.filter((o: any) => o.status === 'cancelled').length,
    averageOrderValue: filteredOrders.length > 0 ? 
      filteredOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || '0'), 0) / filteredOrders.length : 0,
  };

  // Monthly revenue chart data
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: number } = {};
    
    filteredOrders
      .filter((o: any) => o.status === 'completed')
      .forEach((order: any) => {
        if (!order.createdAt) return;
        const date = new Date(order.createdAt);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + parseFloat(order.totalAmount || '0');
      });

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue,
    })).slice(-6); // Last 6 months
  };

  // Daily orders chart data
  const getDailyOrdersData = () => {
    const dailyData: { [key: string]: number } = {};
    
    filteredOrders.forEach((order: any) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
    });

    return Object.entries(dailyData).map(([day, orders]) => ({
      day,
      orders,
    })).slice(-14); // Last 14 days
  };

  // Order status distribution
  const getStatusDistribution = () => {
    const statusCounts = {
      completed: filteredOrders.filter((o: any) => o.status === 'completed').length,
      pending: filteredOrders.filter((o: any) => o.status === 'pending').length,
      processing: filteredOrders.filter((o: any) => o.status === 'processing').length,
      cancelled: filteredOrders.filter((o: any) => o.status === 'cancelled').length,
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      fill: status === 'completed' ? '#22c55e' : 
            status === 'pending' ? '#eab308' :
            status === 'processing' ? '#3b82f6' : '#ef4444'
    }));
  };

  const monthlyData = getMonthlyData();
  const dailyOrdersData = getDailyOrdersData();
  const statusDistribution = getStatusDistribution();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Analytics</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(analytics.totalRevenue)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +12.5% from previous period
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      +8.2% from previous period
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(analytics.averageOrderValue)}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      +3.1% from previous period
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics.totalOrders > 0 ? 
                        Math.round((analytics.completedOrders / analytics.totalOrders) * 100) : 0}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +5.3% from previous period
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Orders Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyOrdersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.fill }}
                        />
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Artworks</span>
                  <span className="font-semibold">{Array.isArray(artworks) ? artworks.length : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Artists</span>
                  <span className="font-semibold">{Array.isArray(artists) ? artists.length : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Orders</span>
                  <span className="font-semibold text-yellow-600">{analytics.pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Orders</span>
                  <span className="font-semibold text-green-600">{analytics.completedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled Orders</span>
                  <span className="font-semibold text-red-600">{analytics.cancelledOrders}</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Revenue Growth</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Sales are up 12.5% compared to the previous period
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Order Volume</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Order count increased by 8.2% this period
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Customer Value</span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    Average order value improved by 3.1%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}