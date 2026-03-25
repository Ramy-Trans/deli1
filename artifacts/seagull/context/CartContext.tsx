import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  variantName?: string;
  addOns: { id: number; name: string; price: number }[];
  specialInstructions?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  branchId: number | null;
  setBranchId: (id: number) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  subtotal: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  branchId: null,
  setBranchId: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [branchId, setBranchIdState] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("cart").then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const normalizedItems = (parsed.items ?? []).map((item: CartItem) => ({
            ...item,
            addOns: item.addOns ?? [],
          }));
          setItems(normalizedItems);
          setBranchIdState(parsed.branchId ?? null);
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((newItems: CartItem[], newBranchId: number | null) => {
    AsyncStorage.setItem("cart", JSON.stringify({ items: newItems, branchId: newBranchId }));
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "id">) => {
      const id = `${item.productId}-${item.variantName ?? "default"}-${Date.now()}`;
      const existing = items.find(
        (i) =>
          i.productId === item.productId &&
          i.variantName === item.variantName &&
          JSON.stringify(i.addOns) === JSON.stringify(item.addOns)
      );

      let newItems: CartItem[];
      if (existing) {
        newItems = items.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        newItems = [...items, { ...item, id }];
      }

      setItems(newItems);
      persist(newItems, branchId);
    },
    [items, branchId, persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      const newItems = items.filter((i) => i.id !== id);
      setItems(newItems);
      persist(newItems, branchId);
    },
    [items, branchId, persist]
  );

  const updateQuantity = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        removeItem(id);
        return;
      }
      const newItems = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
      setItems(newItems);
      persist(newItems, branchId);
    },
    [items, branchId, removeItem, persist]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    AsyncStorage.setItem("cart", JSON.stringify({ items: [], branchId }));
  }, [branchId]);

  const setBranchId = useCallback(
    (id: number) => {
      setBranchIdState(id);
      persist(items, id);
    },
    [items, persist]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const addOnsTotal = (i.addOns ?? []).reduce((a, ao) => a + ao.price, 0);
    return sum + (i.price + addOnsTotal) * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        branchId,
        setBranchId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
