import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminSidebar from "@/components/admin-sidebar";
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
    availableArtworks: artworks.filter((a: any) => a.availability === 'available').length,
    featuredArtworks: artworks.filter((a: any) => a.featured).length,
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

  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">E-Commerce Dashboard</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                22 May 2025 - 18 Jun 2025
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 pr-4 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Congratulations Card */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Congratulations Toby! 🎉</h2>
                  <p className="text-blue-100 mb-4">Best seller of the month</p>
                  <div className="text-2xl font-bold mb-2">$15,231.89</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>+68% from last month</span>
                  </div>
                </div>
                <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                  View Sales
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{stats.revenue}</span>
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stats.revenueChange}
                      </Badge>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">from last month</p>
              </CardContent>
            </Card>

            {/* Sales */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sales</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{stats.sales}</span>
                      <Badge variant="secondary" className="text-red-600 bg-red-50">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {stats.salesChange}
                      </Badge>
                    </div>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm text-muted-foreground">from last month</p>
              </CardContent>
            </Card>

            {/* New Customers */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New Customers</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{stats.customers}</span>
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stats.customersChange}
                      </Badge>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Total Revenue</span>
                  <Button variant="ghost" size="sm">
                    Export
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Income in the last 28 days</p>
                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">Desktop</div>
                    <div className="text-2xl font-bold">24,828</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">Mobile</div>
                    <div className="text-2xl font-bold">25,010</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }} 
                    />
                    <Bar dataKey="desktop" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mobile" fill="#1f2937" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Returning Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Returning Rate</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">$42,379</span>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    +2.5%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={returningRateData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gallery Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Artworks</p>
                    <p className="text-2xl font-bold">{stats.totalArtworks}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-green-600">{stats.availableArtworks}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Featured</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.featuredArtworks}</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Artists</p>
                    <p className="text-2xl font-bold">{stats.totalArtists}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}