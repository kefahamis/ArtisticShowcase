import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";
import { Grid, List } from "lucide-react";
import type { Artist, ArtworkWithArtist } from "@shared/schema";

export default function Artists() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredArtist, setHoveredArtist] = useState<any>(null);

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
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-wide">
            ARTISTS
          </h1>
          <p className="text-lg text-gray-300 font-light max-w-2xl mx-auto">
            Discover the talented artists whose works grace our gallery spaces and define contemporary art today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-600">
            {artistsWithArtwork.length} artist{artistsWithArtwork.length !== 1 ? 's' : ''}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Artists Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-200 aspect-[4/5]" />
                <div className="p-6">
                  <div className="bg-gray-200 h-4 mb-2 rounded" />
                  <div className="bg-gray-200 h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artistsWithArtwork.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="group">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
                  <div className="relative overflow-hidden aspect-[4/5]">
                    {artist.representativeArtwork?.imageUrl ? (
                      <img
                        src={artist.representativeArtwork.imageUrl}
                        alt={`Artwork by ${artist.name}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : artist.imageUrl ? (
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
                        <span className="text-lg font-light">
                          {artist.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  </div>
                  
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-serif font-medium text-gray-900 mb-1 tracking-wide">
                      {artist.name}
                    </h3>
                    {artist.specialty && (
                      <p className="text-sm text-gray-600 font-light tracking-wide uppercase">
                        {artist.specialty}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex">
            {/* Artist Names List */}
            <div className="w-1/2 pr-8">
              <div className="space-y-1">
                {artistsWithArtwork.map((artist) => (
                  <div
                    key={artist.id}
                    className="group relative"
                    onMouseEnter={() => setHoveredArtist(artist)}
                    onMouseLeave={() => setHoveredArtist(null)}
                  >
                    <Link href={`/artists/${artist.id}`} className="block">
                      <div className="py-3 px-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-black transition-colors tracking-wide uppercase font-sans">
                          {artist.name}
                        </h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Artwork Display Area */}
            <div className="w-1/2 pl-8 sticky top-24 h-fit">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                {hoveredArtist ? (
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-xl font-medium tracking-wide mb-1">
                        {hoveredArtist.name}
                      </h4>
                      {hoveredArtist.specialty && (
                        <p className="text-gray-600 text-sm uppercase tracking-wide">
                          {hoveredArtist.specialty}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {(() => {
                        const artistArtworks = artworks?.filter(artwork => artwork.artistId === hoveredArtist.id) || [];
                        
                        if (artistArtworks.length === 0) {
                          return (
                            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 animate-fade-in">
                              <div className="text-center">
                                <div className="text-4xl mb-2">🎨</div>
                                <p className="text-sm">No artworks available</p>
                              </div>
                            </div>
                          );
                        }
                        
                        if (artistArtworks.length === 1) {
                          const artwork = artistArtworks[0];
                          return (
                            <div className="space-y-3 animate-slide-in-up">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                                {artwork.imageUrl ? (
                                  <img
                                    src={artwork.imageUrl}
                                    alt={artwork.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-sm">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="animate-slide-in-up-delayed">
                                <h5 className="font-medium text-gray-900">{artwork.title}</h5>
                                <p className="text-sm text-gray-600">${artwork.price}</p>
                              </div>
                            </div>
                          );
                        }
                        
                        // Multiple artworks - show in mosaic layout
                        return (
                          <div className="space-y-4">
                            {/* Primary artwork - larger */}
                            <div className="animate-slide-in-left">
                              <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden group relative">
                                {artistArtworks[0]?.imageUrl ? (
                                  <img
                                    src={artistArtworks[0].imageUrl}
                                    alt={artistArtworks[0].title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-sm">No Image</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <h5 className="font-medium text-sm mb-1 line-clamp-1">{artistArtworks[0]?.title}</h5>
                                  <p className="text-xs">${artistArtworks[0]?.price}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Secondary artworks grid */}
                            {artistArtworks.length > 1 && (
                              <div className="grid grid-cols-3 gap-2">
                                {artistArtworks.slice(1, 4).map((artwork, index) => (
                                  <div
                                    key={artwork.id}
                                    className={`animate-slide-in-up group ${index === 0 ? 'animate-delay-100' : index === 1 ? 'animate-delay-200' : 'animate-delay-300'}`}
                                  >
                                    <div className="aspect-square bg-gray-100 rounded overflow-hidden relative">
                                      {artwork.imageUrl ? (
                                        <img
                                          src={artwork.imageUrl}
                                          alt={artwork.title}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                          <span className="text-xs">No Image</span>
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="text-white text-xs">
                                          <p className="font-medium line-clamp-1">{artwork.title}</p>
                                          <p className="text-xs">${artwork.price}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Staggered grid for additional artworks */}
                            {artistArtworks.length > 4 && (
                              <div className="grid grid-cols-2 gap-2">
                                {artistArtworks.slice(4, 6).map((artwork, index) => (
                                  <div
                                    key={artwork.id}
                                    className={`animate-slide-in-right group ${index === 0 ? 'animate-delay-400' : 'animate-delay-500'}`}
                                  >
                                    <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden relative">
                                      {artwork.imageUrl ? (
                                        <img
                                          src={artwork.imageUrl}
                                          alt={artwork.title}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                          <span className="text-xs">No Image</span>
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="text-white text-xs">
                                          <p className="font-medium line-clamp-1">{artwork.title}</p>
                                          <p className="text-xs">${artwork.price}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      
                      {(() => {
                        const artistArtworks = artworks?.filter(artwork => artwork.artistId === hoveredArtist.id) || [];
                        return artistArtworks.length > 4 && (
                          <div className="text-center pt-3 border-t">
                            <p className="text-sm text-gray-500">
                              +{artistArtworks.length - 4} more artwork{artistArtworks.length - 4 !== 1 ? 's' : ''}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center text-gray-400">
                    <div className="text-center p-6">
                      <div className="text-6xl mb-4">🎨</div>
                      <p className="text-lg font-light">Hover over an artist to view their artworks</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {artistsWithArtwork.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No artists found</h3>
            <p className="text-gray-500">Check back soon for our featured artists.</p>
          </div>
        )}
      </div>
    </div>
  );
}
