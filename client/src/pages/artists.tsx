import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";
import type { Artist, ArtworkWithArtist } from "@shared/schema";

export default function Artists() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: artists, isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery<ArtworkWithArtist[]>({
    queryKey: ["/api/artworks"],
  });

  const isLoading = artistsLoading || artworksLoading;

  // Get representative artwork for each artist
  const artistsWithArtwork = artists?.map(artist => {
    const representativeArtwork = artworks?.find(artwork => artwork.artistId === artist.id);
    return {
      ...artist,
      representativeArtwork
    };
  }) || [];

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">HOME</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">ARTISTS</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-wider text-gray-900 mb-6">ARTISTS</h1>
          
          {/* View Toggle */}
          <div className="flex justify-center space-x-4">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              className="px-6 py-2 text-sm tracking-wider"
            >
              GRID
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="px-6 py-2 text-sm tracking-wider"
            >
              LIST
            </Button>
          </div>
        </div>

        {/* Artists Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square mb-4" />
                <div className="bg-gray-200 h-4 mb-2" />
              </div>
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {artistsWithArtwork.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="group">
                <div className="relative overflow-hidden bg-gray-100 aspect-square hover:opacity-95 transition-opacity">
                  {artist.representativeArtwork?.imageUrl ? (
                    <img
                      src={artist.representativeArtwork.imageUrl}
                      alt={`Artwork by ${artist.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-sm font-medium tracking-wider text-gray-900 uppercase">
                    {artist.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {artistsWithArtwork.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="group">
                <div className="flex items-start space-x-6 p-6 border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-gray-100">
                    {artist.representativeArtwork?.imageUrl ? (
                      <img
                        src={artist.representativeArtwork.imageUrl}
                        alt={`Artwork by ${artist.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                        <span className="text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium tracking-wider text-gray-900 uppercase mb-2">
                      {artist.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{artist.specialty}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{artist.bio}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {artistsWithArtwork.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No artists available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
