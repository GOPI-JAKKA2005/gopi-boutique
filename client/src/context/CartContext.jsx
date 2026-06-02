import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);
const STORAGE_KEY = "online-shop-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const mrp = items.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
    const discount = Math.max(0, mrp - subtotal);
    const deliveryFee = subtotal > 0 && subtotal < 999 ? 79 : 0;
    return { subtotal, discount, deliveryFee, total: subtotal + deliveryFee };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      isCartOpen,
      setIsCartOpen,
      totals,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem: (product, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((item) => item.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) } : item,
            );
          }
          return [
            ...current,
            {
              id: product.id,
              name: product.name,
              brand: product.brand,
              imageUrl: product.imageUrl || product.images?.[0],
              price: Number(product.discountPrice || product.price),
              originalPrice: Number(product.price),
              stock: Number(product.stock || 99),
              quantity,
            },
          ];
        });
        setIsCartOpen(true);
        toast.success("Added to cart");
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          setItems((current) => current.filter((item) => item.id !== id));
          return;
        }
        setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item)));
      },
      removeItem: (id) => {
        setItems((current) => current.filter((item) => item.id !== id));
        toast.success("Item removed");
      },
      clearCart: () => setItems([]),
    }),
    [items, isCartOpen, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
