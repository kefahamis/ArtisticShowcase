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
    Calendar,
    Palette,
    FileImage,
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
                    isActive: location.startsWith("/admin/artists"),
                },
                {
                    title: "Artworks",
                    href: "/admin/artworks",
                    icon: Palette,
                    isActive: location.startsWith("/admin/artworks"),
                },
                {
                    title: "Orders",
                    href: "/admin/orders",
                    icon: ShoppingCart,
                    isActive: location.startsWith("/admin/orders"),
                },
                {
                    title: "Blog/News",
                    href: "/admin/blog",
                    icon: FileText,
                    isActive: location.startsWith("/admin/blog"),
                },
                {
                    title: "Exhibitions",
                    href: "/admin/exhibitions",
                    icon: Calendar,
                    isActive: location === "/admin/exhibitions",
                },
                {
                    title: "Media Library",
                    href: "/admin/media",
                    icon: FileImage,
                    isActive: location === "/admin/media",
                },
                {
                    title: "Analytics",
                    href: "/admin/analytics",
                    icon: TrendingUp,
                    isActive: location.startsWith("/admin/analytics"),
                },
                // {
                //     title: "Classic Admin",
                //     href: "/admin/classic",
                //     icon: Settings,
                //     isActive: location.startsWith("/admin/classic"),
                // },
            ],
        },
    ];

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full flex-col font-sans">
                <AdminHeader />
                <div className="flex flex-1 overflow-hidden bg-neutral-900">
                    <Sidebar className="bg-blue-950/80 backdrop-blur-xl border-r border-blue-800 text-gray-300 shadow-2xl">
                        <SidebarHeader className="border-b border-blue-800 px-6 py-6 bg-blue-900/60">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg">
                                    <Package className="h-6 w-6" />
                                </div>
                                <span className="font-bold text-2xl text-white font-serif tracking-tight">Navigation</span>
                            </div>
                        </SidebarHeader>

                        <SidebarContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {navigation.map((section) => (
                                <SidebarGroup key={section.title} className="mb-6">
                                    <SidebarGroupLabel className="px-3 py-2 text-xs font-bold text-blue-300 uppercase tracking-widest">
                                        {section.title}
                                    </SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu className="space-y-1">
                                            {section.items.map((item) => (
                                                <SidebarMenuItem key={item.href}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={item.isActive}
                                                        className={`w-full justify-start rounded-lg transition-all duration-200 group
                              ${item.isActive
                                                                ? "bg-blue-800 text-white border-l-4 border-blue-500"
                                                                : "text-blue-200 hover:bg-blue-800/50 hover:text-white border-l-4 border-transparent"
                                                            }`}
                                                    >
                                                        <Link href={item.href} className="flex items-center gap-4 py-3 px-3">
                                                            <item.icon className={`h-5 w-5 transition-colors ${item.isActive ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'}`} />
                                                            <span className="font-semibold text-base">{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            ))}
                        </SidebarContent>

                        <SidebarFooter className="border-t border-blue-800 px-6 py-6 bg-blue-900/60">
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-900 border border-blue-800">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                                    A
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold text-white truncate">Admin </p>
                                    <p className="text-sm text-blue-200 font-light">admin@gallery.com</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleLogout}
                                    className="w-10 h-10 text-blue-200 hover:text-red-400 hover:bg-blue-800 transition-colors rounded-full"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        </SidebarFooter>
                    </Sidebar>

                    <div className="flex-1 flex flex-col overflow-auto">
                        {children}
                    </div>
                </div>
                <AdminFooter />
            </div>
        </SidebarProvider>
    );
}