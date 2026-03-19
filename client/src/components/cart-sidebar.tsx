import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";

export default function CartSidebar() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice,
    getTotalItems 
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-300"
        onClick={toggleCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform translate-x-0 transition-transform duration-500 ease-out sm:rounded-l-2xl">
        {/* Header */}
        <div className="relative p-8 border-b border-gray-100 flex items-center justify-between bg-neutral-900 text-white shadow-md">
          <div className="flex items-center gap-4">
            <ShoppingBag className="w-8 h-8 text-yellow-400" />
            <h3 className="text-3xl font-serif font-bold tracking-tight">Your Cart</h3>
          </div>
          <Badge className="bg-yellow-400 text-neutral-900 font-bold px-3 py-1 text-sm rounded-full shadow-inner">
            {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCart}
            className="absolute top-2 right-2 text-gray-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-light">
              <div className="text-7xl mb-6">🛒</div>
              <p className="text-xl mb-6">Your gallery is empty.</p>
              <Button 
                onClick={toggleCart}
                className="bg-neutral-900 text-white hover:bg-neutral-800 px-8 py-4 rounded-lg text-base font-semibold transition-all shadow-lg"
              >
                Start Exploring Art
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.artwork.id} className="flex items-center space-x-6">
                  <Link href={`/artworks/${item.artwork.id}`} onClick={toggleCart}>
                    <img 
                      src={item.artwork.imageUrl} 
                      alt={item.artwork.title}
                      className="w-24 h-24 object-cover rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-semibold text-lg text-gray-900 truncate">
                      {item.artwork.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      by <span className="font-medium">{item.artwork.artist?.name}</span>
                    </p>
                    <p className="font-bold text-lg text-neutral-800 mt-2">
                      ${parseFloat(item.artwork.price).toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.artwork.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-full border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-base">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item.artwork.id)}
                    className="ml-4 text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="p-8 border-t border-gray-100 bg-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-gray-800">Subtotal:</span>
              <span className="text-4xl font-serif font-extrabold text-neutral-900 tracking-tight">
                ${getTotalPrice().toLocaleString()}
              </span>
            </div>
            <div className="space-y-4">
              <Link href="/checkout">
                <Button 
                  className="w-full bg-yellow-500 text-neutral-900 hover:bg-yellow-400 text-lg font-bold py-7 rounded-2xl shadow-xl transition-all transform-gpu hover:scale-[1.01]"
                  onClick={toggleCart}
                >
                  Proceed to Checkout
                </Button>
              </Link>
              <Button 
                variant="link" 
                className="w-full text-gray-500 hover:text-gray-900 text-base font-semibold"
                onClick={toggleCart}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}