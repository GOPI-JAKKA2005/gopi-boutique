import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function Cart() {
  const { items, totals, updateQuantity, removeItem } = useCart();
  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-black">Shopping cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.length === 0 ? <div className="card p-10 text-center">Your cart is empty.</div> : items.map((item) => (
            <div key={item.id} className="card flex gap-4 p-4">
              <img src={item.imageUrl} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex justify-between gap-3"><div><p className="font-bold">{item.name}</p><p className="text-sm text-slate-500">{formatCurrency(item.price)}</p></div><button className="text-danger" onClick={() => removeItem(item.id)}><FiTrash2 /></button></div>
                <div className="mt-4 flex w-max items-center rounded-lg border"><button className="grid h-9 w-9 place-items-center" onClick={() => updateQuantity(item.id, item.quantity - 1)}><FiMinus /></button><span className="w-9 text-center font-bold">{item.quantity}</span><button className="grid h-9 w-9 place-items-center" onClick={() => updateQuantity(item.id, item.quantity + 1)}><FiPlus /></button></div>
              </div>
            </div>
          ))}
        </div>
        <aside className="card h-max p-5">
          <h2 className="text-xl font-black">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div><div className="flex justify-between"><span>Discount</span><span className="text-success">-{formatCurrency(totals.discount)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(totals.deliveryFee)}</span></div><div className="flex justify-between border-t pt-3 text-lg font-black"><span>Total</span><span>{formatCurrency(totals.total)}</span></div></div>
          <input className="input mt-5" placeholder="Promo code" />
          <Link to="/checkout" className="btn-primary mt-4 w-full">Proceed to Checkout</Link>
        </aside>
      </div>
    </div>
  );
}
