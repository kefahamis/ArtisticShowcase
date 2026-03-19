import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, Home, Palette, ShoppingCart, FileImage, 
  LogOut, TrendingUp, Settings, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { useArtistAuth } from "@/hooks/useArtistAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper component for navigation links to keep the main component clean
const NavLink = ({ item, isCollapsed, isActive, onClick }) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start h-11"
        >
          <item.icon className={`h-5 w-5 shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
          {!isCollapsed && (
            <>
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge variant={isActive ? "default" : "secondary"} className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right">
          {item.label}
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

export default function ArtistSidebar({ className }) {
  const [location, setLocation] = useLocation();
  const { artist, logout } = useArtistAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/artist/login");
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/artist/dashboard" },
    { icon: Palette, label: "My Artworks", path: "/artist/artworks" },
    { icon: ShoppingCart, label: "Orders", path: "/artist/orders" },
    { icon: FileImage, label: "Media Library", path: "/artist/media" },
  ];

  const bottomMenuItems = [
    { icon: Settings, label: "Settings", path: "/artist/settings" },
  ];

  return (
    <div 
      className={`
        relative flex h-full flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${className || ''}
      `}
    >
      {/* Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 h-16 border-b border-gray-200 dark:border-gray-800`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Palette className="h-5 w-5 text-white" />
             </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Artisan</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            item={item}
            isCollapsed={isCollapsed}
            isActive={location === item.path}
            onClick={() => setLocation(item.path)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-1 p-2 border-t border-gray-200 dark:border-gray-800">
        {bottomMenuItems.map((item) => (
           <NavLink
            key={item.path}
            item={item}
            isCollapsed={isCollapsed}
            isActive={location === item.path}
            onClick={() => setLocation(item.path)}
          />
        ))}

        {/* User Profile Section */}
        <div className="p-2">
            <Button variant="ghost" className="w-full justify-start h-auto p-2" onClick={() => setLocation('/artist/profile')}>
                <div className="flex items-center w-full gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800">
                        <span className="font-semibold text-white">{artist?.name?.charAt(0) || 'A'}</span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col items-start min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{artist?.name || 'Artist'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">View Profile</p>
                        </div>
                    )}
                </div>
            </Button>
        </div>
        
        {/* Logout Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-11 text-red-500 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10" onClick={handleLogout}>
                <LogOut className={`h-5 w-5 shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                {!isCollapsed && <span className="truncate">Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
