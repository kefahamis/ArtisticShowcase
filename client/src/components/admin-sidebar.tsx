import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminHeader from "@/components/admin-header";
import AdminFooter from "@/components/admin-footer";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Palette,
  FileText,
  TrendingUp,
} from "lucide-react";

interface AdminSidebarProps {
  children: React.ReactNode;
}

export default function AdminSidebar({ children }: AdminSidebarProps) {
  const [location] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/";
  };

  const navigation = [
    {
      title: "CONTENT MANAGEMENT",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: BarChart3,
          isActive: location === "/admin",
        },
        {
          title: "Artists",
          href: "/admin/artists",
          icon: Users,
          isActive: location === "/admin/artists",
        },
        {
          title: "Artworks",
          href: "/admin/artworks",
          icon: Palette,
          isActive: location === "/admin/artworks",
        },
        {
          title: "Orders",
          href: "/admin/orders",
          icon: ShoppingCart,
          isActive: location === "/admin/orders",
        },
        {
          title: "Blog/News",
          href: "/admin/blog",
          icon: FileText,
          isActive: location === "/admin/blog",
        },
        {
          title: "Analytics",
          href: "/admin/analytics",
          icon: TrendingUp,
          isActive: location === "/admin/analytics",
        },
        {
          title: "Classic Admin",
          href: "/admin/classic",
          icon: Settings,
          isActive: location === "/admin/classic",
        },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col">
        <AdminHeader />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar className="bg-blue-900 border-r border-blue-800">
            <SidebarHeader className="border-b border-blue-800 px-6 py-4 bg-blue-900">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-700 text-white">
                  <Package className="h-4 w-4" />
                </div>
                <span className="font-semibold text-white">Navigation</span>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-2">
              {navigation.map((section) => (
                <SidebarGroup key={section.title}>
                  <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {section.title}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={item.isActive}
                            className={`w-full justify-start text-gray-200 hover:bg-blue-800 hover:text-white ${
                              item.isActive ? "bg-blue-800 text-white" : ""
                            }`}
                          >
                            <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-blue-800 px-4 py-4 bg-blue-900">
              <div className="flex items-center gap-3 p-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Admin User</p>
                  <p className="text-xs text-gray-300">admin@gallery.com</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 hover:bg-blue-800"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </div>
        <AdminFooter />
      </div>
    </SidebarProvider>
  );
}