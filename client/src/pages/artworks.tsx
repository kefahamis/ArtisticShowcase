import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import ArtworkCard from "@/components/artwork-card";
import type { ArtworkWithArtist, Artist } from "@shared/schema";

export default function Artworks() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [artistFilter, setArtistFilter] = useState("all");

  // Get search query from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  // Use search API when there's a search query, otherwise get all artworks
  const { data: artworks, isLoading: artworksLoading } = useQuery<ArtworkWithArtist[]>({
    queryKey: searchQuery ? ["/api/search", searchQuery] : ["/api/artworks"],
    queryFn: async () => {
      if (searchQuery) {
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Search failed');
        return response.json();
      }
      const response = await fetch('/api/artworks');
      if (!response.ok) throw new Error('Failed to fetch artworks');
      return response.json();
    },
  });

  const { data: artists } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const filteredArtworks = artworks?.filter(artwork => {
    const matchesSearch = searchQuery === "" || 
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || artwork.category === categoryFilter;
    const matchesArtist = artistFilter === "all" || artwork.artistId === parseInt(artistFilter);
    
    return matchesSearch && matchesCategory && matchesArtist;
  }) || [];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Artworks Collection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated collection of contemporary artworks from talented artists worldwide
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="painting">Paintings</SelectItem>
                <SelectItem value="sculpture">Sculptures</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="mixed-media">Mixed Media</SelectItem>
              </SelectContent>
            </Select>

            {/* Artist Filter */}
            <Select value={artistFilter} onValueChange={setArtistFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Artist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Artists</SelectItem>
                {artists?.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id.toString()}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setArtistFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            Showing {filteredArtworks.length} of {artworks?.length || 0} artworks
          </p>
        </div>

        {/* Artworks Grid */}
        {artworksLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-80 mb-4 rounded" />
                <div className="bg-gray-300 h-6 mb-2 rounded" />
                <div className="bg-gray-300 h-4 mb-2 rounded w-3/4" />
                <div className="bg-gray-300 h-4 mb-3 rounded w-1/2" />
                <div className="flex justify-between">
                  <div className="bg-gray-300 h-8 w-20 rounded" />
                  <div className="bg-gray-300 h-8 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No artworks found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
