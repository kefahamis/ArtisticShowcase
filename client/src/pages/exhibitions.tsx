import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Sparkles, XCircle, GalleryHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming Skeleton is correctly imported or defined
import type { Exhibition } from "@shared/schema";

export default function Exhibitions() {
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  const { data: exhibitions = [], isLoading } = useQuery({
    queryKey: ["/api/exhibitions"],
  });
    // Create slug from title
    const createSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };
    // Transform database exhibitions to display format
    const transformedExhibitions = useMemo(() => {
      if (!exhibitions || exhibitions.length === 0) return [];
      
      return exhibitions.map((exhibition: Exhibition) => ({
        id: exhibition.id,
        slug: createSlug(exhibition.title),
        title: exhibition.title,
        subtitle: exhibition.subtitle || "",
        location: "GALLERY", // Default location, can be extracted from title if needed
        date: new Date(exhibition.startDate).toLocaleDateString('en-US', { 
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase(),
        endDate: new Date(exhibition.endDate).toLocaleDateString('en-US', { 
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase(),
        time: exhibition.openingReception || "",
        image: exhibition.imageUrl || "/api/placeholder/400/300",
        featured: exhibition.current || false,
        category: exhibition.current ? "current" : "upcoming",
        description: exhibition.description
      }));
    }, [exhibitions]);

  // Gallery locations - standardized to match exhibitionData
  const locations = useMemo(() => [
    "ALL",
    "COSTA MESA",
    "LA JOLLA",
    "LAS VEGAS",
    "NEW ORLEANS",
    "NEW YORK",
    "SAN FRANCISCO",
    "SCHAUMBURG"
  ], []);

    // Filter exhibitions by location
    const filteredExhibitions = useMemo(() => {
      if (selectedLocation === "ALL") {
        return transformedExhibitions;
      }
      return transformedExhibitions.filter(exhibition => 
        exhibition.location.includes(selectedLocation)
      );
    }, [selectedLocation, transformedExhibitions]);
  

  // Combine and sort by category: current, upcoming, then past
  const sortedExhibitions = useMemo(() => {
    const current = filteredExhibitions.filter(e => e.category === "current");
    const upcoming = filteredExhibitions.filter(e => e.category === "upcoming");
    const past = filteredExhibitions.filter(e => e.category === "past");
    return [...current, ...upcoming, ...past];
  }, [filteredExhibitions]);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-gray-100 py-32 md:py-40">
        <div className="container relative z-10 mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 text-gray-900 leading-tight tracking-tighter drop-shadow-lg">
              Explore Our Exhibitions
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-light leading-relaxed max-w-3xl mx-auto mb-12">
              Discover a diverse range of current, upcoming, and past exhibitions across our global gallery network.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-8 py-20">
        {/* Location Filter Tabs */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-serif font-bold mb-8 text-gray-900">Filter by Location</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`py-3 px-6 rounded-full font-semibold text-lg transition-all duration-300 shadow-md
                  ${selectedLocation === location
                    ? "bg-gray-900 text-white transform scale-105 hover:bg-gray-800"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* Exhibitions Grid */}
        <section className="pb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden rounded-3xl shadow-lg border-none animate-pulse bg-white">
                  <Skeleton className="h-64 w-full rounded-b-none" />
                  <CardHeader className="p-8 space-y-4">
                    <Skeleton className="h-5 w-24 rounded-full mb-2" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedExhibitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {sortedExhibitions.map((exhibition) => (
                <Link key={exhibition.id} href={`/exhibitions/${exhibition.slug}`} className="block group">
                  <Card className="overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-none bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={exhibition.image}
                        alt={exhibition.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/600x450/E0E0E0/333333?text=Image+Error"; }}
                      />

                      {/* Featured Overlay or Category Badge */}
                      {exhibition.featured ? (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-start justify-end p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Sparkles className="w-12 h-12 text-yellow-400 mb-4 drop-shadow-lg" />
                          <h3 className="text-4xl font-serif font-bold leading-tight mb-2 uppercase drop-shadow-lg">
                            {exhibition.title.split(":")[0]}
                          </h3>
                          {exhibition.subtitle && (
                            <p className="text-lg font-medium text-gray-200 mb-2 drop-shadow-md">
                              {exhibition.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-gray-100 text-base font-semibold">
                            <MapPin className="w-5 h-5" /> {exhibition.location}
                          </div>
                          <div className="flex items-center gap-4 text-gray-100 text-base font-semibold mt-1">
                            <CalendarDays className="w-5 h-5" /> {exhibition.date}
                            {exhibition.time && (
                                <><Clock className="w-5 h-5 ml-4" /> {exhibition.time}</>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="absolute top-6 left-6 z-10">
                          <Badge className="bg-white/90 text-gray-800 font-semibold px-4 py-1.5 rounded-full shadow-md backdrop-blur-sm">
                            {exhibition.category.toUpperCase()}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="p-8">
                      <CardTitle className="text-2xl font-serif font-bold line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
                        {exhibition.title}
                      </CardTitle>
                      {exhibition.subtitle && (
                        <p className="text-gray-600 text-base font-light line-clamp-2 mt-2 leading-relaxed">
                          {exhibition.subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{exhibition.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{exhibition.date}</span>
                        </div>
                        {exhibition.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{exhibition.time}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            // Empty state when no exhibitions are found for the selected filter
            <div className="text-center py-24">
              <div className="max-w-xl mx-auto">
                <XCircle className="w-24 h-24 text-gray-300 mx-auto mb-8" />
                <h3 className="text-4xl font-serif font-bold text-gray-700 mb-6">
                  No Exhibitions Found
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed">
                  There are no exhibitions matching your selection at this time.
                  Please try a different location or check back later for new announcements!
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}