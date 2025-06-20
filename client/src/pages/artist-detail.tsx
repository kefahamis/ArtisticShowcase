import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import ArtworkCard from "@/components/artwork-card";
import type { Artist, ArtworkWithArtist } from "@shared/schema";

export default function ArtistDetail() {
  const [, params] = useRoute("/artists/:id");
  const artistId = parseInt(params?.id || "0");

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ["/api/artists", artistId],
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery<ArtworkWithArtist[]>({
    queryKey: ["/api/artworks", { artist: artistId }],
  });

  if (artistLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
          <Link href="/artists">
            <Button>Return to Artists</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/artists">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artists
          </Button>
        </Link>

        {/* Artist Profile */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              {artist.name}
            </h1>
            <Badge className="bg-yellow-600 text-white w-fit mb-6">
              {artist.specialty}
            </Badge>
            <p className="text-lg text-gray-600 leading-relaxed">
              {artist.bio}
            </p>
          </div>
        </div>

        {/* Artist's Artworks */}
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Artworks by {artist.name}</h2>
          
          {artworksLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
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
          ) : artworks && artworks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No artworks available for this artist.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
