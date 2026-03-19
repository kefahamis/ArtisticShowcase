import { Link } from "wouter";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

/**
 * @typedef {Object} SocialLink
 * @property {string} href - The URL for the social media page.
 * @property {React.ReactNode} icon - The Lucide icon component for the social media platform.
 * @property {string} label - The accessible label for the link.
 */

/**
 * An array of social media links to be displayed in the footer.
 * @type {SocialLink[]}
 */
const socialLinks = [
  { href: "#", icon: <Instagram className="w-5 h-5" />, label: "Instagram" },
  { href: "#", icon: <Facebook className="w-5 h-5" />, label: "Facebook" },
  { href: "#", icon: <Twitter className="w-5 h-5" />, label: "Twitter" },
  { href: "#", icon: <Youtube className="w-5 h-5" />, label: "Youtube" },
];

/**
 * Renders a single quick link item.
 * @param {object} props - The component's props.
 * @param {string} props.href - The URL for the link.
 * @param {string} props.children - The text content of the link.
 */
const QuickLinkItem = ({ href, children }) => (
  <li>
    <Link href={href} className="text-gray-300 hover:text-white transition-colors duration-200 font-light">
      {children}
    </Link>
  </li>
);

/**
 * Renders a single contact info item.
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.icon - The Lucide icon component.
 * @param {string} props.text - The contact information text.
 */
const ContactInfoItem = ({ icon, text }) => (
  <div className="flex items-center space-x-3">
    {icon}
    <span className="text-gray-300 font-light">{text}</span>
  </div>
);

/**
 * A responsive and feature-rich footer component for a contemporary art gallery website.
 * It includes company information, quick links, contact details, a newsletter subscription form,
 * social media links, and legal links.
 */
export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { toast } = useToast();

  /**
   * Handles the newsletter subscription form submission.
   * @param {React.FormEvent} e - The form event.
   */
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/newsletter/subscribe", { email: newsletterEmail });
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter!",
      });
      setNewsletterEmail("");
    } catch (error) {
      const errorMessage = error.message || "Something went wrong. Please try again.";
      toast({
        title: "Error",
        description: `Failed to subscribe: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-black font-serif text-2xl font-bold">TA</span>
              </div>
              <div>
                <h3 className="text-xl font-serif font-light tracking-wide">TALANTA ART</h3>
                <p className="text-sm text-gray-400 tracking-widest uppercase mt-1">Fine Art Collection</p>
              </div>
            </div>
            <p className="text-gray-300 font-light leading-relaxed">
              Discover exceptional works from internationally acclaimed artists. Experience the intersection of tradition and innovation.
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={`Link to our ${link.label} page`}
                >
                  {link.icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold tracking-wide border-b-2 border-gray-700 pb-2">EXPLORE</h4>
            <ul className="space-y-3">
              <QuickLinkItem href="/artworks">Artworks</QuickLinkItem>
              <QuickLinkItem href="/artists">Artists</QuickLinkItem>
              <QuickLinkItem href="/exhibitions">Exhibitions</QuickLinkItem>
              <QuickLinkItem href="/blog">Blog</QuickLinkItem>
              <QuickLinkItem href="/about">About Us</QuickLinkItem>
              <QuickLinkItem href="/contact">Contact</QuickLinkItem>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold tracking-wide border-b-2 border-gray-700 pb-2">CONTACT</h4>
            <div className="space-y-4">
              <ContactInfoItem icon={<MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />} text="123 Nairobi, Kenya" />
              <ContactInfoItem icon={<Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />} text="+1 (555) 123-4567" />
              <ContactInfoItem icon={<Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />} text="info@talantaart.com" />
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                <strong className="text-white">Gallery Hours:</strong><br />
                Tue-Sat: 10am-6pm<br />
                Sunday: 12pm-5pm<br />
                Closed Mondays
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold tracking-wide border-b-2 border-gray-700 pb-2">NEWSLETTER</h4>
            <p className="text-gray-300 font-light">
              Stay updated with our latest exhibitions, featured artists, and exclusive events.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors duration-200"
                aria-label="Email address for newsletter subscription"
              />
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-gray-200 font-bold tracking-wider uppercase text-sm py-3 transition-colors duration-200"
              >
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <p className="text-gray-500 text-sm font-light text-center md:text-left">
              &copy; {new Date().getFullYear()} Contemporary Gallery. All rights reserved.
            </p>
            <nav aria-label="Legal and administrative links">
              <ul className="flex flex-wrap justify-center md:justify-end gap-6">
                <li>
                  <Link href="/privacy" className="text-gray-500 hover:text-white text-sm font-light transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-500 hover:text-white text-sm font-light transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
                
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}