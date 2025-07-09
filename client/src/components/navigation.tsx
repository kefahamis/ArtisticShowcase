import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Menu, X, Search, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import CartSidebar from "./cart-sidebar";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { toggleCart, getTotalItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/artworks?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearch(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Artworks", href: "/artworks" },
    { name: "Artists", href: "/artists" },
    { name: "Exhibitions", href: "/exhibitions" },
    { name: "Appointments", href: "/appointments" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <span className="text-white font-serif text-xl font-bold">TA</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-serif font-light tracking-wide text-gray-900">
                    TALANTA ART
                  </h1>
                  <p className="text-xs text-gray-500 tracking-widest uppercase">
                    Contemporary Art Gallery
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 hover:text-gray-600 ${isActive(item.href) ? "text-black border-b-2 border-black pb-1" : "text-gray-700"
                    }`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {!showSearch ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-black"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="w-5 h-5" />
                </Button>
              ) : (
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search artworks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-60 pl-10 pr-8"
                    autoFocus
                    onBlur={() => {
                      if (!searchQuery) setShowSearch(false);
                    }}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </form>
              )}
              <Link href="/artist/login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black">
                  Artist Portal
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCart}
                className="relative text-gray-700 hover:text-black"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCart}
                className="relative text-gray-700"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-6">
              <div className="space-y-4">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`block py-3 text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${isActive(item.href) ? "text-black" : "text-gray-700"
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </div>
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-gray-700">
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </Button>

                    <Button variant="ghost" size="sm" className="text-gray-700">
                      <User className="w-5 h-5 mr-2" />
                      Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <CartSidebar />
    </>
  );
}