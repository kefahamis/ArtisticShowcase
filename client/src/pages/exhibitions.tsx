import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ArtworkCard from "@/components/artwork-card";
import { Calendar, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { Exhibition, ArtworkWithArtist } from "@shared/schema";

export default function Exhibitions() {
  const { data: currentExhibition, isLoading: loadingExhibition } = useQuery({
    queryKey: ["/api/exhibitions/current"],
  });

  const { data: featuredArtworks = [], isLoading: loadingArtworks } = useQuery({
    queryKey: ["/api/artworks/featured"],
  });

  if (loadingExhibition || loadingArtworks) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading exhibition...</p>
        </div>
      </div>
    );
  }

  if (!currentExhibition) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-serif text-gray-800">No Current Exhibition</h1>
          <p className="text-gray-600">Check back soon for upcoming exhibitions.</p>
        </div>
      </div>
    );
  }

  const exhibition = currentExhibition as Exhibition;
  const startDate = new Date(exhibition.startDate);
  const endDate = new Date(exhibition.endDate);
  const isOngoing = new Date() >= startDate && new Date() <= endDate;

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <div className="relative h-[70vh] bg-gray-900 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${exhibition.imageUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl text-white space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Badge 
                variant={isOngoing ? "default" : "secondary"} 
                className={`${isOngoing ? "bg-green-600 hover:bg-green-700" : "bg-gray-600"} text-white px-4 py-2 text-sm font-medium`}
              >
                {isOngoing ? "Now Showing" : "Exhibition"}
              </Badge>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Calendar className="w-4 h-4" />
                <span>
                  {startDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })} - {endDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-light leading-tight">
              {exhibition.title}
            </h1>
            
            <p className="text-xl text-gray-200 leading-relaxed max-w-2xl">
              {exhibition.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/artworks">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8">
                  View All Artworks
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/artists">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8">
                  Meet the Artists
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Exhibition Details */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-serif font-light mb-6">About the Exhibition</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p>
                  {exhibition.description}
                </p>
                <p>
                  This carefully curated exhibition brings together works that challenge traditional 
                  boundaries and invite viewers to engage with art in new and meaningful ways. Each 
                  piece has been selected for its unique contribution to the contemporary art landscape 
                  and its ability to spark dialogue and reflection.
                </p>
                <p>
                  The exhibition represents a collaboration between established and emerging artists, 
                  showcasing diverse perspectives and artistic approaches that define our current 
                  cultural moment. Visitors will experience a journey through different mediums, 
                  from traditional painting and sculpture to cutting-edge digital art and installations.
                </p>
              </div>
            </div>

            {/* Featured Artworks */}
            <div>
              <h2 className="text-3xl font-serif font-light mb-8">Featured Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(featuredArtworks as ArtworkWithArtist[]).slice(0, 4).map((artwork: ArtworkWithArtist) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
              
              {(featuredArtworks as ArtworkWithArtist[]).length > 4 && (
                <div className="text-center mt-8">
                  <Link href="/artworks">
                    <Button variant="outline" size="lg">
                      View All Featured Artworks
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Exhibition Info */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-serif font-medium">Exhibition Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Duration</p>
                      <p className="text-sm text-gray-600">
                        {startDate.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        through {endDate.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">Main Gallery</p>
                      <p className="text-sm text-gray-600">123 Art District Ave</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Hours</p>
                      <p className="text-sm text-gray-600">Tuesday - Saturday: 10am - 6pm</p>
                      <p className="text-sm text-gray-600">Sunday: 12pm - 5pm</p>
                      <p className="text-sm text-gray-600">Closed Mondays</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Admission</p>
                      <p className="text-sm text-gray-600">Free and open to the public</p>
                      <p className="text-sm text-gray-600">Group tours available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artist Talk */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-serif font-medium">Upcoming Events</h3>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-gray-900 pl-4">
                    <p className="font-medium text-gray-900">Artist Talk & Panel Discussion</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Join our featured artists for an intimate discussion about their work 
                      and creative processes.
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      Saturday, {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric' 
                      })} at 2:00 PM
                    </p>
                  </div>

                  <div className="border-l-4 border-gray-900 pl-4">
                    <p className="font-medium text-gray-900">Gallery Walk & Wine Reception</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Experience the exhibition with a curator-led tour followed by 
                      wine and light refreshments.
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      Friday, {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric' 
                      })} at 6:00 PM
                    </p>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  RSVP for Events
                </Button>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-serif font-medium">Stay Updated</h3>
                <p className="text-sm text-gray-600">
                  Subscribe to our newsletter for exhibition updates, artist features, 
                  and exclusive events.
                </p>
                <Link href="/#newsletter">
                  <Button className="w-full">
                    Subscribe to Newsletter
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}