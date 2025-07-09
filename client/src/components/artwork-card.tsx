import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { ArtworkWithArtist } from "@shared/schema-old";
import ImageZoom from "./image-zoom";

interface ArtworkCardProps {
  artwork: ArtworkWithArtist;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-black hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Heart className="w-4 h-4" />
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
              by <span className="font-medium">{artwork.artist.name}</span>
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
    </Link>
  );
}