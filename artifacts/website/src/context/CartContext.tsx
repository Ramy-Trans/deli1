import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantName?: string;
  addOnNames?: string[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  coupon: { code: string; discount: number; couponId: number } | null;
  applyCoupon: (c: { code: string; discount: number; couponId: number } | null) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; discount: number; couponId: number } | null>(null);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${item.productId}-${item.variantName ?? "default"}-${Date.now()}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.variantName === item.variantName);
      if (existing) {
        return prev.map((i) => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, { ...item, id }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) { setItems((prev) => prev.filter((i) => i.id !== id)); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => { setItems([]); setCoupon(null); }, []);
  const applyCoupon = useCallback((c: { code: string; discount: number; couponId: number } | null) => setCoupon(c), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - (coupon?.discount ?? 0));
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, coupon, applyCoupon }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
