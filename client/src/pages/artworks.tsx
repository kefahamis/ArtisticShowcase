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
    <div className="min-h-screen bg-neutral-50 pt-20 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-serif font-extrabold text-neutral-900 mb-6 drop-shadow-sm">
            Discover Artworks
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Explore our curated collection of stunning artworks from talented artists around the globe.
            Find your next inspiration or a beautiful piece for your home.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-8 rounded-2xl shadow-xl mb-12 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
          <div className="grid md:grid-cols-4 gap-6 items-end">
            {/* Search */}
            <div className="relative col-span-full md:col-span-2">
              <label htmlFor="search-input" className="block text-sm font-semibold text-gray-700 mb-2">
                Search by Title, Description, or Artist
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Search artworks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category-select" className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full rounded-lg border-2 border-gray-200 py-3 px-4 transition-all hover:border-gray-300">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-lg shadow-lg border border-gray-100">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="painting">Paintings</SelectItem>
                  <SelectItem value="sculpture">Sculptures</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="mixed-media">Mixed Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Artist Filter */}
            <div>
              <label htmlFor="artist-select" className="block text-sm font-semibold text-gray-700 mb-2">
                Artist
              </label>
              <Select value={artistFilter} onValueChange={setArtistFilter}>
                <SelectTrigger className="w-full rounded-lg border-2 border-gray-200 py-3 px-4 transition-all hover:border-gray-300">
                  <SelectValue placeholder="Artist" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-lg shadow-lg border border-gray-100">
                  <SelectItem value="all">All Artists</SelectItem>
                  {artists?.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id.toString()}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end justify-end md:justify-start">
              <Button
                variant="outline"
                className="w-full md:w-auto h-auto py-3 px-6 text-gray-600 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-300 transition-all"
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
        </div>

        {/* Results Count */}
        <div className="mb-10 text-center">
          <p className="text-gray-600 text-lg font-medium">
            Showing <span className="font-bold text-indigo-600">{filteredArtworks.length}</span> of <span className="font-bold text-gray-900">{artworks?.length || 0}</span> artworks
          </p>
        </div>
        
        <hr className="mb-12 border-gray-200" />

        {/* Artworks Grid */}
        {artworksLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6">
                <div className="bg-gray-200 h-72 mb-6 rounded-xl" />
                <div className="space-y-3">
                  <div className="bg-gray-200 h-8 rounded-lg w-4/5" />
                  <div className="bg-gray-200 h-6 rounded-lg w-1/2" />
                  <div className="bg-gray-200 h-5 rounded-lg w-3/4" />
                </div>
                <div className="flex justify-between items-center mt-6">
                  <div className="bg-gray-200 h-10 w-24 rounded-lg" />
                  <div className="bg-gray-200 h-10 w-28 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
            <svg
              className="mx-auto h-20 w-20 text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
              />
            </svg>
            <h3 className="mt-2 text-3xl font-bold text-gray-900">No artworks found</h3>
            <p className="mt-2 text-lg text-gray-600 max-w-md mx-auto">
              It seems there are no artworks that match your search criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}