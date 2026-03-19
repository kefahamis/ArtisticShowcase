import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Bell, Settings, User, Plus, Upload,
    Menu, Sun, Moon, HelpCircle
} from "lucide-react";
import { useArtistAuth } from "@/hooks/useArtistAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

interface ArtistHeaderProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export default function ArtistHeader({ title = "Dashboard", subtitle, actions }: ArtistHeaderProps) {
    const { artist, user, logout } = useArtistAuth();
    const [, setLocation] = useLocation();

    const handleLogout = () => {
        logout();
        setLocation("/artist/login");
    };

    return (
        <header className="sticky top-0 bg-[#172554] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 backdrop-blur-lg supports-[backdrop-filter]:bg-[]-900/60">
            <div className="flex items-center justify-between">
                {/* Left side - Title */}
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white dark:text-white">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-white dark:text-white">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Center - Search */}
                <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search artworks, orders..."
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        />
                    </div>
                </div>

                {/* Right side - Actions and User */}
                <div className="flex items-center space-x-4">
                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2 px-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-white">
                                        {artist?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900 text-white">
                                        {artist?.name || user?.username || 'Artist'}
                                    </p>
                                    <p className="text-xs text-white dark:text-gray-400">
                                        {user?.email}
                                    </p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setLocation("/artist/profile")}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation("/artist/settings")}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}