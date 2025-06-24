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


        {/* Main Content */}
        <div className="p-6 space-y-6">
  

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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