import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Share2, Ruler, Palette } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import ImageZoom from "@/components/image-zoom";
import type { ArtworkWithArtist } from "@shared/schema";

export default function ArtworkDetail() {
  const [, params] = useRoute("/artworks/:id");
  const artworkId = params?.id ? parseInt(params.id) : 0;
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: artwork, isLoading } = useQuery<ArtworkWithArtist>({
    queryKey: ["/api/artworks", artworkId],
    enabled: artworkId > 0,
    queryFn: async () => {
      const response = await fetch(`/api/artworks/${artworkId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch artwork");
      }
      return response.json();
    },
  });

  const handleAddToCart = () => {
    if (artwork && artwork.availability === "available") {
      addToCart(artwork);
      toast({
        title: "Added to cart",
        description: `${artwork.title} has been added to your cart.`,
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked
        ? "Artwork removed from your favorites"
        : "Artwork added to your favorites",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork?.title,
        text: `Check out this amazing artwork: ${artwork?.title} by ${artwork?.artist?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Artwork link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
          <p className="text-gray-600 font-medium">Loading artwork details...</p>
        </div>
      </div>
    );
  }

  if (!artwork || artworkId === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Artwork Not Found</h1>
          <p className="text-gray-600 mb-6">
            The artwork you are looking for does not exist or has been removed.
          </p>
          <Link href="/artworks">
            <Button className="bg-indigo-600 hover:bg-indigo-700 transition-colors">
              Return to Artworks
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Button */}
        <Link href="/artworks">
          <Button variant="ghost" className="mb-10 text-gray-600 hover:bg-gray-100 transition-colors px-0">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to All Artworks
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-3xl shadow-2xl overflow-hidden aspect-square flex items-center justify-center border-4 border-white transition-all duration-500 hover:scale-[1.01]">
              <ImageZoom src={artwork.imageUrl} alt={artwork.title} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLike}
                className={`flex-1 transition-all duration-300 transform-gpu hover:scale-105 ${isLiked ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"}`}
              >
                <Heart className={`w-5 h-5 mr-3 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                {isLiked ? "Added to Favorites" : "Add to Favorites"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="flex-1 bg-white text-gray-600 border-gray-200 hover:bg-gray-100 transition-all duration-300 transform-gpu hover:scale-105"
              >
                <Share2 className="w-5 h-5 mr-3 text-gray-500" />
                Share Artwork
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div>
            <div className="mb-8">
              <h1 className="text-6xl font-serif font-extrabold text-neutral-900 leading-tight mb-4 drop-shadow-sm">
                {artwork.title}
              </h1>
              <Link href={`/artists/${artwork.artistId}`}>
                <p className="text-2xl text-indigo-600 font-semibold hover:underline cursor-pointer transition-colors">
                  by {artwork.artist?.name}
                </p>
              </Link>
            </div>

            {/* Price & Availability */}
            <div className="flex items-center gap-6 mb-8">
              <span className="text-5xl font-bold text-gray-900 tracking-tight">
                ${parseFloat(artwork.price).toLocaleString()}
              </span>
              <Badge
                className={`text-base font-semibold px-4 py-1.5 rounded-full shadow-sm ${
                  artwork.availability === "available"
                    ? "bg-emerald-100 text-emerald-800"
                    : artwork.availability === "sold"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {artwork.availability
                  ? artwork.availability.charAt(0).toUpperCase() + artwork.availability.slice(1)
                  : "Unknown"}
              </Badge>
            </div>

            {/* Purchase Actions */}
            <div className="space-y-4 mb-10">
              {artwork.availability === "available" ? (
                <>
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-indigo-600 text-white font-bold text-lg py-7 rounded-lg shadow-lg hover:bg-indigo-700 transition-all transform-gpu hover:scale-[1.01]"
                  >
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="w-full text-indigo-600 border-2 border-indigo-200 font-semibold text-lg py-7 rounded-lg hover:bg-indigo-50 transition-colors">
                    Inquire About This Piece
                  </Button>
                </>
              ) : artwork.availability === "sold" ? (
                <Button disabled className="w-full font-bold text-lg py-7 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed">
                  Sold Out
                </Button>
              ) : (
                <Button variant="outline" className="w-full font-bold text-lg py-7 rounded-lg text-gray-600 border-2 border-gray-200 hover:bg-gray-100">
                  Inquire About Availability
                </Button>
              )}
            </div>
            
            {/* Artwork Details */}
            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
              <CardContent className="p-8">
                <h3 className="font-bold text-2xl text-neutral-900 mb-6 flex items-center gap-3">
                  <Palette className="w-7 h-7 text-indigo-600" />
                  Artwork Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-lg">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Medium:</span>
                    <span className="font-semibold text-gray-900">{artwork.medium}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Dimensions:</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Ruler className="w-5 h-5 mr-2 text-gray-400" />
                      {artwork.dimensions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Category:</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {/* Here is the fix: Add a check for artwork.category before calling replace */}
                      {artwork.category ? artwork.category.replace("-", " ") : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <CardContent className="p-8">
                <h3 className="font-bold text-2xl text-neutral-900 mb-4">About the Artwork</h3>
                <p className="text-gray-700 leading-relaxed text-base">{artwork.description}</p>
              </CardContent>
            </Card>

            {/* Artist Info */}
            {artwork.artist && (
              <Card className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardContent className="p-8">
                  <h3 className="font-bold text-2xl text-neutral-900 mb-6">Meet the Artist</h3>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {artwork.artist.imageUrl && (
                      <img
                        src={artwork.artist.imageUrl}
                        alt={artwork.artist.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-md flex-shrink-0"
                      />
                    )}
                    <div className="text-center sm:text-left">
                      <Link href={`/artists/${artwork.artistId}`}>
                        <h4 className="font-bold text-2xl text-indigo-600 hover:underline cursor-pointer mb-1">
                          {artwork.artist.name}
                        </h4>
                      </Link>
                      <p className="text-gray-500 italic text-base mb-3">{artwork.artist.specialty}</p>
                      <p className="text-gray-700 leading-relaxed line-clamp-4">{artwork.artist.bio}</p>
                      <Link href={`/artists/${artwork.artistId}`}>
                        <Button variant="link" className="p-0 h-auto text-base font-semibold mt-3 text-indigo-600 hover:text-indigo-800 transition-colors">
                          View Artist Profile →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}