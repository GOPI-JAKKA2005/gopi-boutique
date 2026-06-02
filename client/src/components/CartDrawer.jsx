import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, totals } = useCart();

  return (
    <Dialog
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Drawer container */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-8 sm:pl-12">
          <DialogPanel className="flex h-full w-screen max-w-md flex-col bg-white shadow-2xl dark:bg-slate-950">

            {/* Header */}
            <div className="flex items-center justify-between border-b p-5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <FiShoppingBag className="text-xl text-primary" />
                <DialogTitle className="text-lg font-extrabold">Your Cart</DialogTitle>
                {items.length > 0 && (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-black text-white">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              >
                <FiX />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <FiShoppingBag className="mx-auto text-5xl text-slate-200 dark:text-slate-700" />
                    <p className="mt-4 text-lg font-bold">Your cart is empty</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Find something you love and add it here.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="btn-primary mt-6"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-xl border p-3 dark:border-white/10">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200"}
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{item.name}</p>
                        {item.brand && (
                          <p className="text-xs text-slate-400">{item.brand}</p>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <p className="font-bold text-primary">{formatCurrency(item.price)}</p>
                          {item.originalPrice > item.price && (
                            <p className="text-xs text-slate-400 line-through">{formatCurrency(item.originalPrice)}</p>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border dark:border-white/10">
                            <button
                              className="grid h-8 w-8 place-items-center hover:text-primary"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <FiMinus />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">
                              {item.quantity}
                            </span>
                            <button
                              className="grid h-8 w-8 place-items-center hover:text-primary"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <FiPlus />
                            </button>
                          </div>
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-danger dark:hover:bg-red-500/10"
                            onClick={() => removeItem(item.id)}
                            aria-label="Remove item"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="space-y-4 border-t p-5 dark:border-white/10">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Discount</span>
                      <span className="font-semibold text-emerald-600">-{formatCurrency(totals.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery</span>
                    <span>{totals.deliveryFee === 0 ? <span className="font-semibold text-emerald-600">Free</span> : formatCurrency(totals.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-lg font-extrabold dark:border-white/10">
                    <span>Total</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-secondary w-full"
                >
                  Continue Shopping
                </button>
              </div>
            )}

          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
