import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, Home, Palette, Package, ShoppingCart, FileImage, 
  LogOut, Menu, X, TrendingUp, Settings 
} from "lucide-react";
import { useArtistAuth } from "@/hooks/useArtistAuth";

interface ArtistSidebarProps {
  className?: string;
}

export default function ArtistSidebar({ className }: ArtistSidebarProps) {
  const [, setLocation] = useLocation();
  const { artist, logout } = useArtistAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/artist/login");
  };

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/artist/dashboard",
      badge: null,
    },
    {
      icon: Palette,
      label: "My Artworks", 
      path: "/artist/artworks",
      badge: null,
    },
    {
      icon: ShoppingCart,
      label: "Orders",
      path: "/artist/orders",
      badge: null,
    },
    {
      icon: FileImage,
      label: "Media Library",
      path: "/artist/media",
      badge: null,
    },


  ];

  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Artist Portal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create & Manage</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Artist Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {artist?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {artist?.name || 'Artist'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {artist?.specialty || 'Creative Artist'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}
            onClick={() => setLocation(item.path)}
          >
            <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} text-gray-500`} />
            {!isCollapsed && (
              <>
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20`}
          onClick={handleLogout}
        >
          <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}