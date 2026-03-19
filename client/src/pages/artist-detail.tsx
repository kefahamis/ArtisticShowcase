import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import ArtworkCard from "@/components/artwork-card";
import SeoHead from "@/components/seo-head";
import { useUser } from "@/hooks/useUser";
import type { Artist, ArtworkWithArtist } from "@shared/schema";

export default function ArtistDetail() {
  const [, params] = useRoute("/artists/:slug");
  const artistSlug = params?.slug || "";
  const { userEmail } = useUser();

  const { data: artist, isLoading: artistLoading, error: artistError } = useQuery<Artist>({
    queryKey: ["/api/artists/slug", artistSlug],
    queryFn: async () => {
      if (!artistSlug) {
        throw new Error('No artist slug provided');
      }
      const response = await fetch(`/api/artists/slug/${encodeURIComponent(artistSlug)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch artist: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!artistSlug,
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery<ArtworkWithArtist[]>({
    queryKey: ["/api/artworks", "artist", artist?.id],
    queryFn: async () => {
      const response = await fetch(`/api/artworks?artist=${artist?.id}`);
      if (!response.ok) throw new Error('Failed to fetch artworks');
      return response.json();
    },
    enabled: !!artist?.id,
  });

  if (artistLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading artist profile...</p>
        </div>
      </div>
    );
  }

  if (artistError) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Artist</h1>
          <p className="text-gray-600 mb-4">{artistError.message}</p>
          <p className="text-sm text-gray-500 mb-4">Slug: {artistSlug}</p>
          <Link href="/artists">
            <Button>Return to Artists</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
          <p className="text-gray-600 mb-4">The artist "{artistSlug}" could not be found.</p>
          <Link href="/artists">
            <Button>Return to Artists</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <SeoHead 
        title={artist?.metaTitle || `${artist?.name} - Artist Profile` || "Artist Profile"}
        description={artist?.metaDescription || artist?.bio || `Discover artworks by ${artist?.name}` || "Explore artist profile and artworks"}
        type="profile"
        image={artist?.imageUrl}
      />
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
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
                {artist.name}
              </h1>
              {artist.featured && (
                <Badge className="bg-black text-white text-xs px-3 py-1">
                  FEATURED
                </Badge>
              )}
            </div>
            <Badge className="bg-yellow-600 text-white w-fit mb-6 text-sm px-3 py-1">
              {artist.specialty}
            </Badge>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {artist.bio}
            </p>
            
            {/* Artist Stats */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide font-light">Status</p>
                <p className="font-medium text-gray-900">
                  {artist.approved ? "Verified Artist" : "Pending Verification"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide font-light">Artworks</p>
                <p className="font-medium text-gray-900">
                  {artworks?.length || 0} Available
                </p>
              </div>
            </div>
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
                <ArtworkCard key={artwork.id} artwork={artwork} userEmail={userEmail} />
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
