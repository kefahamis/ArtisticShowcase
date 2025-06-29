import { Bell, Search, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminHeader() {
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-neutral-900/60 text-white border-b border-neutral-700">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg font-serif">AG</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-50 tracking-tight font-serif">Art Gallery</h1>
              <p className="text-xs text-gray-400 font-light tracking-wide">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-2xl mx-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="search"
              placeholder="Search artists, artworks, orders..."
              className="w-full pl-12 pr-6 h-11 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button 
              variant="ghost" 
              size="icon" 
              className="relative w-10 h-10 text-gray-400 hover:bg-neutral-800 hover:text-blue-400 transition-colors rounded-full"
            >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          </Button>

          {/* Settings */}
          <Button 
              variant="ghost" 
              size="icon"
              className="w-10 h-10 text-gray-400 hover:bg-neutral-800 hover:text-blue-400 transition-colors rounded-full"
            >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-full overflow-hidden p-0 transition-transform duration-200 hover:scale-105 ring-2 ring-transparent hover:ring-blue-500">
                <Avatar className="h-11 w-11">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
                  <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-cyan-600 text-white font-semibold">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-neutral-900 rounded-xl shadow-2xl p-2 mt-2 border border-neutral-700" align="end" forceMount>
              <DropdownMenuLabel className="font-semibold p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-base font-bold leading-none text-white">Gallery Admin</p>
                  <p className="text-sm leading-none text-gray-500">
                    admin@gallery.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-800 my-2" />
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer text-gray-300 hover:bg-neutral-800 rounded-lg transition-colors focus:bg-neutral-800 focus:text-white">
                <User className="h-5 w-5 text-blue-400" />
                <span className="font-medium">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer text-gray-300 hover:bg-neutral-800 rounded-lg transition-colors focus:bg-neutral-800 focus:text-white">
                <Settings className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-800 my-2" />
              <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="flex items-center gap-3 p-3 cursor-pointer text-red-400 hover:bg-neutral-800 rounded-lg transition-colors focus:bg-neutral-800 focus:text-red-300"
                >
                <LogOut className="h-5 w-5 text-red-500" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}