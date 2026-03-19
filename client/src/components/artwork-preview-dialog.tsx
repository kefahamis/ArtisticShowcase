import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { ArtworkWithArtist } from "@shared/schema";

interface ArtworkPreviewDialogProps {
  artwork: ArtworkWithArtist | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function ArtworkPreviewDialog({ 
  artwork, 
  isOpen, 
  onClose, 
  isFavorite = false,
  onToggleFavorite 
}: ArtworkPreviewDialogProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!artwork) return null;

  const handleAddToCart = () => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
        <DialogTitle className="sr-only">{artwork.title}</DialogTitle>
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 bg-white/90 hover:bg-white"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square bg-gray-100">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            
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

          {/* Details Section */}
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-light text-gray-900">
                {artwork.title}
              </h2>
              <p className="text-lg text-gray-600 font-light">
                by <span className="font-medium">{artwork.artist?.name}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 uppercase tracking-wide text-xs font-light">Medium</p>
                  <p className="font-medium">{artwork.medium}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide text-xs font-light">Dimensions</p>
                  <p className="font-medium">{artwork.dimensions}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 uppercase tracking-wide text-xs font-light mb-2">Category</p>
                <Badge variant="outline" className="text-xs">
                  {artwork.category}
                </Badge>
              </div>

              <div>
                <p className="text-gray-500 uppercase tracking-wide text-xs font-light mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed">{artwork.description}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 uppercase tracking-wide text-xs font-light">Price</p>
                  <p className="text-2xl font-serif font-light">
                    KSh {formatPrice(artwork.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 uppercase tracking-wide text-xs font-light">Availability</p>
                  <p className="font-medium capitalize">{artwork.availability}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={artwork.availability === "sold"}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                
                {onToggleFavorite && (
                  <Button
                    variant="outline"
                    onClick={onToggleFavorite}
                    className={`border-gray-300 ${
                      isFavorite 
                        ? "bg-red-50 text-red-600 border-red-300 hover:bg-red-100" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}