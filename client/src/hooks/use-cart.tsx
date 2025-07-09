import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ArtworkWithArtist } from "@shared/schema-old";

interface CartItem {
  artwork: ArtworkWithArtist;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (artwork: ArtworkWithArtist, quantity?: number) => void;
  removeFromCart: (artworkId: number) => void;
  updateQuantity: (artworkId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("gallery-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("gallery-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (artwork: ArtworkWithArtist, quantity = 1) => {
    if (artwork.availability !== "available") {
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.artwork.id === artwork.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.artwork.id === artwork.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { artwork, quantity }];
      }
    });
  };

  const removeFromCart = (artworkId: number) => {
    setItems(prevItems => prevItems.filter(item => item.artwork.id !== artworkId));
  };

  const updateQuantity = (artworkId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(artworkId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.artwork.id === artworkId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsOpen(prev => !prev);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.artwork.price) * item.quantity);
    }, 0);
  };

  const value: CartContextType = {
    items,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
