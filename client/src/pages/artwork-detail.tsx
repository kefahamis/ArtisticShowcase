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
  const artworkId = parseInt(params?.id || "0");
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: artwork, isLoading } = useQuery<ArtworkWithArtist>({
    queryKey: ["/api/artworks", artworkId],
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
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artwork Not Found</h1>
          <Link href="/artworks">
            <Button>Return to Artworks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/artworks">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artworks
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <ImageZoom src={artwork.imageUrl} alt={artwork.title} />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={isLiked ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                {artwork.title}
              </h1>
              <Link href={`/artists/${artwork.artistId}`}>
                <p className="text-xl text-yellow-600 hover:text-yellow-700 transition-colors">
                  by {artwork.artist?.name}
                </p>
              </Link>
            </div>

            {/* Availability Status */}
            <div className="mb-6">
              <Badge
                className={
                  artwork.availability === "available"
                    ? "bg-green-100 text-green-800"
                    : artwork.availability === "sold"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }
              >
                {artwork.availability
                  ? artwork.availability.charAt(0).toUpperCase() + artwork.availability.slice(1)
                  : "Unknown"}
              </Badge>
            </div>

            {/* Price */}
            <div className="mb-8">
              <span className="text-3xl font-bold text-gray-900">
                ${parseFloat(artwork.price).toLocaleString()}
              </span>
            </div>

            {/* Artwork Details */}
            <div className="space-y-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Palette className="w-5 h-5 mr-2 text-yellow-600" />
                    Artwork Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medium:</span>
                      <span className="font-medium">{artwork.medium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium">{artwork.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">
                        {artwork.category.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{artwork.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Purchase Actions */}
            <div className="space-y-4">
              {artwork.availability === "available" ? (
                <>
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-gray-900 text-white hover:bg-yellow-600 transition-colors py-4 text-lg"
                  >
                    Add to Cart - ${parseFloat(artwork.price).toLocaleString()}
                  </Button>
                  <Button variant="outline" className="w-full py-4">
                    Inquire About This Piece
                  </Button>
                </>
              ) : artwork.availability === "sold" ? (
                <Button disabled className="w-full py-4">
                  Sold Out
                </Button>
              ) : (
                <Button variant="outline" className="w-full py-4">
                  Inquire About Availability
                </Button>
              )}
            </div>

            {/* Artist Info */}
            {artwork.artist && (
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">About the Artist</h3>
                  <div className="flex items-start gap-4">
                    {artwork.artist.imageUrl && (
                      <img
                        src={artwork.artist.imageUrl}
                        alt={artwork.artist.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{artwork.artist.name}</h4>
                      <p className="text-yellow-600 text-sm mb-2">{artwork.artist.specialty}</p>
                      <p className="text-gray-600 text-sm line-clamp-3">{artwork.artist.bio}</p>
                      <Link href={`/artists/${artwork.artistId}`}>
                        <Button variant="link" className="p-0 h-auto text-sm">
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
