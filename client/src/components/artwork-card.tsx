import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ArtworkWithArtist } from "@shared/schema";
import ArtworkPreviewDialog from "./artwork-preview-dialog";

interface ArtworkCardProps {
  artwork: ArtworkWithArtist;
  userEmail?: string; // Optional for guest users
}

export default function ArtworkCard({ artwork, userEmail = "guest@example.com" }: ArtworkCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if artwork is in favorites
  const { data: favoriteStatus } = useQuery({
    queryKey: ["/api/favorites", userEmail, artwork.id],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/${encodeURIComponent(userEmail)}/${artwork.id}`);
      if (!response.ok) return { isFavorite: false };
      return response.json();
    },
    enabled: !!userEmail && userEmail !== "guest@example.com",
  });

  // Update local state when favorite status changes
  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorite(favoriteStatus.isFavorite);
    }
  }, [favoriteStatus]);

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", {
        userEmail,
        artworkId: artwork.id,
      });
    },
    onSuccess: () => {
      setIsFavorite(true);
      toast({
        title: "Added to Favorites",
        description: `"${artwork.title}" has been added to your favorites.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", userEmail] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/favorites", {
        userEmail,
        artworkId: artwork.id,
      });
    },
    onSuccess: () => {
      setIsFavorite(false);
      toast({
        title: "Removed from Favorites",
        description: `"${artwork.title}" has been removed from your favorites.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", userEmail] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (artwork.availability === "sold") {
      toast({
        title: "Artwork Unavailable",
        description: "This artwork has been sold.",
        variant: "destructive",
      });
      return;
    }

    addToCart(artwork);
    toast({
      title: "Added to Cart",
      description: `"${artwork.title}" has been added to your cart.`,
    });
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewOpen(true);
  };

  const handleToggleFavorite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (userEmail === "guest@example.com") {
      toast({
        title: "Login Required",
        description: "Please login to add items to favorites.",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice.toLocaleString();
  };

  return (
    <Link href={`/artworks/${artwork.id}`}>
      <Card className="group cursor-pointer border-0 shadow-none hover:shadow-lg transition-all duration-300 bg-white">
        <div className="relative overflow-hidden">
          <div className="aspect-[4/5] relative">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-black hover:bg-white"
                  onClick={handlePreview}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  className={`bg-white/90 hover:bg-white ${
                    isFavorite 
                      ? "text-red-600" 
                      : "text-black"
                  }`}
                  onClick={handleToggleFavorite}
                  disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-black hover:bg-white"
                  onClick={handleAddToCart}
                  disabled={artwork.availability === "sold"}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Status badges */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              {artwork.featured && (
                <Badge className="bg-black text-white text-xs px-2 py-1">
                  FEATURED
                </Badge>
              )}
              {artwork.availability === "sold" && (
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  SOLD
                </Badge>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-3">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-light text-gray-900 group-hover:text-black transition-colors">
              {artwork.title}
            </h3>
            <p className="text-sm text-gray-600 font-light tracking-wide">
              by <span className="font-medium">{artwork.artist?.name || "Unknown Artist"}</span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-light tracking-wide uppercase">
              <span>{artwork.medium}</span>
              <span>{artwork.dimensions}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-light text-gray-900">
                ${formatPrice(artwork.price)}
              </div>
              
              <Badge variant="outline" className="text-xs font-light tracking-wide uppercase">
                {artwork.category}
              </Badge>
            </div>
          </div>

          <Button
            className="w-full bg-black text-white hover:bg-gray-800 font-medium tracking-widest uppercase text-xs py-3"
            onClick={handleAddToCart}
            disabled={artwork.availability === "sold"}
          >
            {artwork.availability === "sold" ? "SOLD OUT" : "ADD TO CART"}
          </Button>
        </CardContent>
      </Card>
      
      {/* Preview Dialog */}
      <ArtworkPreviewDialog
        artwork={artwork}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
      />
    </Link>
  );
}