import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";
import { Grid, List } from "lucide-react";
import { createSlug } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Artist, ArtworkWithArtist } from "@shared/schema";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.talantaart.com";

export default function Artists() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredArtist, setHoveredArtist] = useState<Artist | null>(null);
  const { toast } = useToast();

  // Fetch artists
  const {
    data: artists = [],
    isLoading: artistsLoading,
    error: artistsError,
  } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/artists`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch artists" }));
        throw new Error(error.message || "Failed to fetch artists");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch artworks (only for approved artists)
  const {
    data: artworks = [],
    isLoading: artworksLoading,
    error: artworksError,
  } = useQuery<ArtworkWithArtist[]>({
    queryKey: ["/api/artworks"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/artworks`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch artworks" }));
        throw new Error(error.message || "Failed to fetch artworks");
      }
      return response.json();
    },
    enabled: !!artists && artists.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Fetch artworks for a specific artist in list view
  const {
    data: hoveredArtistArtworks = [],
    isLoading: hoveredArtworksLoading,
  } = useQuery<ArtworkWithArtist[]>({
    queryKey: ["/api/artworks", hoveredArtist?.id],
    queryFn: async () => {
      if (!hoveredArtist) return [];
      const response = await fetch(`${API_BASE_URL}/api/artworks?artist=${hoveredArtist.id}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch artist artworks" }));
        throw new Error(error.message || "Failed to fetch artist artworks");
      }
      return response.json();
    },
    enabled: !!hoveredArtist && viewMode === "list",
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Error handling with toast
  if (artistsError || artworksError) {
    toast({
      title: "Error",
      description: (artistsError || artworksError)?.message || "An unexpected error occurred",
      variant: "destructive",
    });
  }

  const isLoading = artistsLoading || artworksLoading;

  // Filter approved artists and map with representative artwork
  const artistsWithArtwork = artists
    .filter((artist) => artist.approved)
    .map((artist) => {
      const representativeArtwork = artworks.find((artwork) => artwork.artistId === artist.id);
      return {
        ...artist,
        representativeArtwork,
      };
    });

  // Handle image URLs with fallback
  const getImageUrl = (url?: string | null) => {
    if (!url) return `${API_BASE_URL}/uploads/placeholder.jpg`;
    return url.startsWith("http://") || url.startsWith("https://") ? url : `${API_BASE_URL}${url}`;
  };

  return (
    <div className="min-h-screen pt-20 bg-neutral-50 font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20 shadow-inner">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-4 drop-shadow-md">
            ARTISTS
          </h1>
          <p className="text-xl text-gray-300 font-light max-w-3xl mx-auto tracking-wide">
            Explore the visionaries and masters shaping the world of contemporary art.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-transparent to-neutral-50 pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Controls */}
          <div className="flex justify-between items-center mb-10">
            <div className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
              {artistsWithArtwork.length} artist{artistsWithArtwork.length !== 1 ? "s" : ""} on display
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-inner border border-gray-100">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-10 w-10 p-0 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-black text-white hover:bg-neutral-800" : "bg-transparent text-gray-400 hover:bg-gray-100"
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-10 w-10 p-0 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-black text-white hover:bg-neutral-800" : "bg-transparent text-gray-400 hover:bg-gray-100"
                }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Artists Display */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {[...Array(Math.min(artistsWithArtwork.length || 8, 12))].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-3xl shadow-xl overflow-hidden transition-transform duration-300 transform-gpu hover:scale-105"
                >
                  <div className="bg-gray-200 aspect-[4/5]" />
                  <div className="p-8">
                    <div className="bg-gray-200 h-6 w-3/4 mb-3 rounded-lg" />
                    <div className="bg-gray-200 h-4 w-1/2 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {artistsWithArtwork.map((artist) => (
                <Link key={artist.id} href={`/artists/${createSlug(artist.name)}`} className="group block">
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-500 transform-gpu group-hover:-translate-y-4 group-hover:shadow-2xl border-4 border-white group-hover:border-gray-100">
                    <div className="relative overflow-hidden aspect-[4/5]">
                      {artist.representativeArtwork?.imageUrl || artist.imageUrl ? (
                        <img
                          src={getImageUrl(artist.representativeArtwork?.imageUrl || artist.imageUrl)}
                          alt={`Artwork or portrait for ${artist.name}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400" aria-label={`Placeholder for ${artist.name}`}>
                          <span className="text-6xl font-light font-serif">
                            {artist.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="p-8 text-center">
                      <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2 tracking-tight">
                        {artist.name}
                      </h3>
                      {artist.specialty && (
                        <p className="text-sm text-gray-600 font-medium tracking-wider uppercase">
                          {artist.specialty}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex gap-16">
              {/* Artist Names List */}
              <div className="w-1/2">
                <div className="space-y-1">
                  {artistsWithArtwork.map((artist) => (
                    <div
                      key={artist.id}
                      className="group relative"
                      onMouseEnter={() => setHoveredArtist(artist)}
                      onMouseLeave={() => setHoveredArtist(null)}
                      onClick={() => setHoveredArtist(artist)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setHoveredArtist(artist)}
                    >
                      <Link href={`/artists/${createSlug(artist.name)}`} className="block">
                        <div className="py-6 px-8 hover:bg-neutral-100 transition-colors duration-200 cursor-pointer border-b border-gray-200">
                          <h3 className="text-2xl font-sans font-semibold text-gray-900 group-hover:text-black transition-colors tracking-wide">
                            {artist.name}
                          </h3>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artwork Display Area */}
              <div className="w-1/2 sticky top-32 h-fit transition-opacity duration-300 ease-in-out">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                  {hoveredArtist ? (
                    <div className="p-8">
                      <div className="mb-6">
                        <h4 className="text-3xl font-serif font-bold tracking-tight mb-2">
                          {hoveredArtist.name}
                        </h4>
                        {hoveredArtist.specialty && (
                          <p className="text-gray-600 text-sm uppercase tracking-wide">
                            {hoveredArtist.specialty}
                          </p>
                        )}
                      </div>

                      <div className="space-y-6">
                        {hoveredArtworksLoading ? (
                          <div className="animate-pulse aspect-square bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-dashed border-gray-200" aria-label="Loading artworks">
                            <div className="text-center p-6">
                              <div className="text-6xl mb-4">🖼️</div>
                              <p className="text-lg font-light">Loading artworks...</p>
                            </div>
                          </div>
                        ) : hoveredArtistArtworks.length === 0 ? (
                          <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 animate-fade-in border border-dashed border-gray-200" aria-label="No artworks available">
                            <div className="text-center p-6">
                              <div className="text-6xl mb-4">🖼️</div>
                              <p className="text-lg font-light">No artworks available for this artist.</p>
                            </div>
                          </div>
                        ) : hoveredArtistArtworks.length === 1 ? (
                          <div className="space-y-5 animate-slide-in-up">
                            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden group shadow-lg">
                              <img
                                src={getImageUrl(hoveredArtistArtworks[0].imageUrl)}
                                alt={hoveredArtistArtworks[0].title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                                loading="lazy"
                              />
                            </div>
                            <div className="text-center">
                              <h5 className="font-semibold text-gray-900 text-lg">
                                {hoveredArtistArtworks[0].title}
                              </h5>
                              <p className="text-sm text-gray-600 font-light">
                                Price: ${hoveredArtistArtworks[0].price}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="animate-slide-in-left">
                              <div className="aspect-[5/3] bg-gray-100 rounded-2xl overflow-hidden group relative shadow-lg">
                                <img
                                  src={getImageUrl(hoveredArtistArtworks[0]?.imageUrl)}
                                  alt={hoveredArtistArtworks[0]?.title || "Artwork"}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-5 left-5 right-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <h5 className="font-bold text-xl mb-1 line-clamp-1">
                                    {hoveredArtistArtworks[0]?.title}
                                  </h5>
                                  <p className="text-sm font-light">Price: ${hoveredArtistArtworks[0]?.price}</p>
                                </div>
                              </div>
                            </div>

                            {hoveredArtistArtworks.length > 1 && (
                              <div className="grid grid-cols-2 gap-4">
                                {hoveredArtistArtworks.slice(1, 5).map((artwork, index) => (
                                  <div
                                    key={artwork.id}
                                    className={`animate-slide-in-up group ${
                                      index === 0
                                        ? "animate-delay-100"
                                        : index === 1
                                        ? "animate-delay-200"
                                        : index === 2
                                        ? "animate-delay-300"
                                        : "animate-delay-400"
                                    }`}
                                  >
                                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative shadow-md">
                                      <img
                                        src={getImageUrl(artwork.imageUrl)}
                                        alt={artwork.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="text-white">
                                          <p className="font-semibold text-sm line-clamp-1">{artwork.title}</p>
                                          <p className="text-xs font-light">${artwork.price}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {hoveredArtistArtworks.length > 5 && (
                              <div className="text-center pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 font-medium">
                                  +{hoveredArtistArtworks.length - 5} more artwork
                                  {hoveredArtistArtworks.length - 5 !== 1 ? "s" : ""} available.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center text-gray-400 p-10" aria-label="Select an artist">
                      <div className="text-center">
                        <div className="text-8xl mb-6 animate-pulse">✨</div>
                        <p className="text-xl font-light max-w-sm">
                          Select an artist{" "}
                          {artistsWithArtwork.length > 0 ? "to see their work come to life here" : "to view their artworks"}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {artistsWithArtwork.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🤷‍♂️</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">No approved artists found</h3>
              <p className="text-gray-500 text-lg">We're curating our collection. Please check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}