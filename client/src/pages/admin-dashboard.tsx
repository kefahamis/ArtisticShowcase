import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminSidebar from "@/components/admin-sidebar";
import { ImageUpload } from "@/components/image-upload";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Search,
  Download,
  Bell,
  Settings,
  User,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Filter,
  Eye,
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/login");
    }
  }, [setLocation]);

  // Fetch data
  const { data: artworks = [] } = useQuery({
    queryKey: ["/api/artworks"],
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["/api/artists"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Calculate statistics
  const stats = {
    revenue: "$125,231",
    revenueChange: "+25.1%",
    sales: "20K",
    salesChange: "-1.7%",
    customers: "3602",
    customersChange: "+6.3%",
    totalArtworks: artworks.length,
    availableArtworks: artworks.filter((a) => a.availability === 'available').length,
    featuredArtworks: artworks.filter((a) => a.featured).length,
    totalArtists: artists.length,
    totalOrders: orders.length,
  };

  // Sample data for charts
  const revenueData = [
    { month: "Jan", desktop: 24828, mobile: 25010 },
    { month: "Feb", desktop: 28500, mobile: 26200 },
    { month: "Mar", desktop: 32100, mobile: 28900 },
    { month: "Apr", desktop: 29800, mobile: 31500 },
    { month: "May", desktop: 35200, mobile: 33100 },
    { month: "Jun", desktop: 38900, mobile: 35800 },
  ];

  const returningRateData = [
    { month: "Jan", rate: 35379 },
    { month: "Feb", rate: 38420 },
    { month: "Mar", rate: 42379 },
    { month: "Apr", rate: 39800 },
    { month: "May", rate: 45200 },
    { month: "Jun", rate: 48900 },
  ];

  // Sample data for recent orders and top artworks
  const recentOrders = [
    { id: "#3210", customer: "Olivia Davis", date: "June 23, 2024", status: "Shipped", amount: "$450" },
    { id: "#3209", customer: "John Smith", date: "June 22, 2024", status: "Pending", amount: "$720" },
    { id: "#3208", customer: "Jessica Lee", date: "June 21, 2024", status: "Delivered", amount: "$1200" },
    { id: "#3207", customer: "Mark Wilson", date: "June 20, 2024", status: "Cancelled", amount: "$300" },
    { id: "#3206", customer: "Sarah Brown", date: "June 19, 2024", status: "Shipped", amount: "$890" },
  ];

  const topArtworks = [
    { title: "Abstract Sensation", artist: "Alex Johnson", views: "1.2K", img: "https://via.placeholder.com/60" },
    { title: "Digital Dreamscape", artist: "Maria Garcia", views: "980", img: "https://via.placeholder.com/60" },
    { title: "Coastal Serenity", artist: "David Chen", views: "750", img: "https://via.placeholder.com/60" },
    { title: "Urban Rhapsody", artist: "Emily Adams", views: "620", img: "https://via.placeholder.com/60" },
  ];

  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <Bell className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <Settings className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
              <User className="w-8 h-8 text-blue-600" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Revenue Card */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.revenue}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-green-600">{stats.revenueChange}</span> from last month
                </p>
              </CardContent>
            </Card>

            {/* Sales Card */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.sales}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-red-600">{stats.salesChange}</span> from last month
                </p>
              </CardContent>
            </Card>

            {/* Customers Card */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.customers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-green-600">{stats.customersChange}</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="desktop" stroke="#8884d8" fill="#8884d8" name="Desktop" />
                      <Area type="monotone" dataKey="mobile" stroke="#82ca9d" fill="#82ca9d" name="Mobile" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Returning Customer Rate Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Returning Customer Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={returningRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gallery Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Artworks</p>
                    <p className="text-4xl font-bold mt-1">{stats.totalArtworks}</p>
                  </div>
                  <Package className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <p className="text-4xl font-bold mt-1 text-green-600">{stats.availableArtworks}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Featured</p>
                    <p className="text-4xl font-bold mt-1 text-purple-600">{stats.featuredArtworks}</p>
                  </div>
                  <Eye className="w-12 h-12 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Artists</p>
                    <p className="text-4xl font-bold mt-1">{stats.totalArtists}</p>
                  </div>
                  <Users className="w-12 h-12 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders and Top Artworks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-semibold">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={
                            order.status === "Shipped"
                              ? "default"
                              : order.status === "Pending"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                        <p className="font-bold">{order.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Top Artworks */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Top Artworks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topArtworks.map((artwork) => (
                    <div key={artwork.title} className="flex items-center space-x-4 border-b pb-2">
                      <img src={artwork.img} alt={artwork.title} className="w-16 h-16 rounded-md object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{artwork.title}</p>
                        <p className="text-sm text-gray-500">{artwork.artist}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{artwork.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}