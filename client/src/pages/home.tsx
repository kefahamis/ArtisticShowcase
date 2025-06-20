import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Award, Eye, ChevronDown, Heart, Mail } from "lucide-react";
import ArtworkCard from "@/components/artwork-card";
import ArtistCard from "@/components/artist-card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Artist, Exhibition, ArtworkWithArtist } from "@shared/schema";

export default function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { toast } = useToast();

  const { data: featuredArtists, isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists/featured"],
  });

  const { data: featuredArtworks, isLoading: artworksLoading } = useQuery<ArtworkWithArtist[]>({
    queryKey: ["/api/artworks/featured"],
  });

  const { data: currentExhibition } = useQuery<Exhibition>({
    queryKey: ["/api/exhibitions/current"],
  });

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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium Gallery Style */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&h=1080&fit=crop&q=80"
            alt="Gallery Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-8">
                <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm mb-6 px-4 py-2 text-sm font-light tracking-widest">
                  FINE ART GALLERY
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-white mb-8 leading-[0.9]">
                CONTEMPORARY
                <br />
                <span className="font-normal italic">Masterpieces</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl font-light leading-relaxed">
                Discover exceptional works from internationally acclaimed artists. 
                Experience the intersection of tradition and innovation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/artworks">
                  <Button 
                    size="lg" 
                    className="bg-white text-black hover:bg-gray-100 font-medium tracking-widest uppercase text-sm px-8 py-4 h-auto"
                  >
                    EXPLORE COLLECTION
                    <ArrowRight className="ml-3 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/artists">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-black font-medium tracking-widest uppercase text-sm px-8 py-4 h-auto"
                  >
                    FEATURED ARTISTS
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Gallery Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Award className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-4xl font-light text-gray-900">25+</h3>
              <p className="text-gray-600 font-light tracking-wide">YEARS OF EXCELLENCE</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Star className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-4xl font-light text-gray-900">500+</h3>
              <p className="text-gray-600 font-light tracking-wide">CURATED ARTWORKS</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Eye className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-4xl font-light text-gray-900">100+</h3>
              <p className="text-gray-600 font-light tracking-wide">FEATURED ARTISTS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Exhibition */}
      {currentExhibition && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-light tracking-widest">
                CURRENT EXHIBITION
              </Badge>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4">
                {currentExhibition.title}
              </h2>
              {currentExhibition.subtitle && (
                <p className="text-xl text-gray-600 font-light italic">
                  {currentExhibition.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed font-light">
                  {currentExhibition.description}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">Duration:</span>
                    <span className="text-gray-900">
                      {new Date(currentExhibition.startDate).toLocaleDateString()} - {new Date(currentExhibition.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {currentExhibition.openingReception && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">Opening Reception:</span>
                      <span className="text-gray-900">
                        {new Date(currentExhibition.openingReception).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <Button className="bg-black text-white hover:bg-gray-800 font-medium tracking-widest uppercase text-sm px-8 py-3">
                  VIEW EXHIBITION
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <img
                  src={currentExhibition.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"}
                  alt={currentExhibition.title}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Artworks */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-light tracking-widest">
              FEATURED COLLECTION
            </Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4">
              Exceptional Artworks
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Discover our carefully selected collection of contemporary masterpieces
            </p>
          </div>

          {artworksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 animate-pulse">
                  <div className="w-full h-64 bg-gray-200 mb-4"></div>
                  <div className="h-4 bg-gray-200 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredArtworks?.slice(0, 6).map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/artworks">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-100 font-medium tracking-widest uppercase text-sm px-8 py-3"
              >
                VIEW ALL ARTWORKS
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-light tracking-widest">
              FEATURED ARTISTS
            </Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4">
              Renowned Masters
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Meet the visionary artists who shape contemporary art
            </p>
          </div>

          {artistsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {featuredArtists?.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/artists">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-100 font-medium tracking-widest uppercase text-sm px-8 py-3"
              >
                VIEW ALL ARTISTS
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm mb-6 px-4 py-2 text-sm font-light tracking-widest">
              STAY CONNECTED
            </Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Gallery Newsletter
            </h2>
            <p className="text-xl text-white/80 font-light mb-8">
              Be the first to know about new exhibitions, artist features, and exclusive events
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="bg-white/10 border-white/30 text-white placeholder:text-white/60 flex-1"
              />
              <Button 
                type="submit" 
                className="bg-white text-black hover:bg-gray-100 font-medium tracking-widest uppercase text-sm px-6"
              >
                <Mail className="w-4 h-4 mr-2" />
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}