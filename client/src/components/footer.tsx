import { Link } from "wouter";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/newsletter/subscribe", { email: newsletterEmail });
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter!",
      });
      setNewsletterEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe",
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white flex items-center justify-center">
                <span className="text-black font-serif text-xl font-bold">G</span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-light">CONTEMPORARY GALLERY</h3>
                <p className="text-xs text-gray-400 tracking-widest uppercase">Fine Art Collection</p>
              </div>
            </div>
            <p className="text-gray-300 font-light leading-relaxed">
              Discover exceptional works from internationally acclaimed artists. Experience the intersection of tradition and innovation.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium tracking-wide">EXPLORE</h4>
            <ul className="space-y-2">
              <li><Link href="/artworks" className="text-gray-300 hover:text-white transition-colors font-light">Artworks</Link></li>
              <li><Link href="/artists" className="text-gray-300 hover:text-white transition-colors font-light">Artists</Link></li>
              <li><Link href="/exhibitions" className="text-gray-300 hover:text-white transition-colors font-light">Exhibitions</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors font-light">Blog</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors font-light">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors font-light">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium tracking-wide">CONTACT</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 font-light">123 Art District, New York, NY 10001</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 font-light">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 font-light">info@contemporarygallery.com</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-400 font-light">
                <strong>Gallery Hours:</strong><br />
                Tue-Sat: 10am-6pm<br />
                Sunday: 12pm-5pm<br />
                Closed Mondays
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium tracking-wide">NEWSLETTER</h4>
            <p className="text-gray-300 font-light">
              Stay updated with our latest exhibitions and featured artists.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-gray-100 font-medium tracking-wide uppercase text-sm"
              >
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm font-light">
              © 2024 Contemporary Gallery. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm font-light transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm font-light transition-colors">
                Terms of Service
              </Link>
              <Link href="/admin" className="text-gray-400 hover:text-white text-sm font-light transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}