import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CartSidebar from "@/components/cart-sidebar";
import Home from "@/pages/home";
import Artists from "@/pages/artists";
import ArtistDetail from "@/pages/artist-detail";
import Artworks from "@/pages/artworks";
import ArtworkDetail from "@/pages/artwork-detail";
import Exhibitions from "@/pages/exhibitions";
import ExhibitionDetail from "@/pages/exhibition-detail";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Appointments from "@/pages/appointments";
import Orders from "@/pages/orders";
import Checkout from "@/pages/checkout";
import Admin from "@/pages/admin";
import ArtistRegister from "@/pages/artist-register";
import ArtistLogin from "@/pages/artist-login";
import ArtistDashboard from "@/pages/artist-dashboard";
import ArtistProfile from "@/pages/artist-profile";
import ArtistArtworks from "@/pages/artist-artworks";
import ArtistOrders from "@/pages/artist-orders";
import ArtistMedia from "@/pages/artist-media";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminArtists from "@/pages/admin-artists";
import AdminArtworks from "@/pages/admin-artworks";
import AdminOrders from "@/pages/admin-orders";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminMedia from "@/pages/admin-media";
import AdminUsers from "@/pages/admin-users";
import AdminBlog from "@/pages/admin-blog";
import AdminMediaLibrary from "@/pages/admin-media";
import AdminBlogAnalytics from "@/pages/admin-blog-analytics";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import AdminExhibitions from "@/pages/admin-exhibitions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/artists" component={Artists} />
      <Route path="/artists/:id" component={ArtistDetail} />
      <Route path="/artworks" component={Artworks} />
      <Route path="/artworks/:id" component={ArtworkDetail} />
      <Route path="/exhibitions" component={Exhibitions} />
      <Route path="/exhibitions/:slug" component={ExhibitionDetail} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin/classic" component={Admin} />
      <Route path="/admin/artists" component={AdminArtists} />
      <Route path="/admin/artworks" component={AdminArtworks} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/blog" component={AdminBlog} />
      <Route path="/admin/blog/analytics" component={AdminBlogAnalytics} />
      <Route path="/admin/media" component={AdminMedia} />
      <Route path="/admin/media" component={AdminMedia} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/exhibitions" component={AdminExhibitions} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={Login} />
      <Route path="/artist/register" component={ArtistRegister} />
      <Route path="/artist/login" component={ArtistLogin} />
      <Route path="/artist/dashboard" component={ArtistDashboard} />
      <Route path="/artist/profile" component={ArtistProfile} />
      <Route path="/artist/artworks" component={ArtistArtworks} />
      <Route path="/artist/orders" component={ArtistOrders} />
      <Route path="/artist/media" component={ArtistMedia} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith('/admin');
  const isArtistPage = location.startsWith('/artist/');

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <div className="min-h-screen bg-white flex flex-col">
          {!isAdminPage && !isArtistPage && <Navigation />}
          <main className={isAdminPage || isArtistPage ? "flex-1" : "flex-1"}>
            <Router />
          </main>
          {!isAdminPage && !isArtistPage && <Footer />}
          {!isAdminPage && !isArtistPage && <CartSidebar />}
        </div>
        <Toaster />
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
