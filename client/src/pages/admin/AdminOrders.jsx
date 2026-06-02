import { useState } from "react";
import toast from "react-hot-toast";
import AdminNav from "../../components/AdminNav";
import { updateOrderStatus } from "../../firebase/db";
import { useOrders } from "../../hooks/useOrders";
import { formatCurrency } from "../../utils/formatCurrency";

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const { orders } = useOrders();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState("");
  const filtered = filter === "all" ? orders : orders.filter((order) => order.status === filter);

  async function changeStatus(id, status) {
    await updateOrderStatus(id, status);
    toast.success("Order updated");
  }

  return (
    <div className="container-page py-10">
      <AdminNav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><h1 className="text-4xl font-black">Orders</h1><select className="input max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="card mt-6 overflow-hidden">
        {filtered.map((order) => (
          <div key={order.id} className="border-b last:border-b-0">
            <button className="grid w-full gap-4 p-4 text-left md:grid-cols-[1fr_1fr_140px_170px]" onClick={() => setOpen(open === order.id ? "" : order.id)}>
              <b>#{order.id.slice(0, 8)}</b><span>{order.userName || order.userEmail}</span><b>{formatCurrency(order.totalAmount)}</b>
              <select className="input py-2" value={order.status} onClick={(e) => e.stopPropagation()} onChange={(e) => changeStatus(order.id, e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
            </button>
            {open === order.id && <div className="bg-slate-50 p-4 text-sm dark:bg-white/5"><p className="font-bold">Shipping</p><p className="mt-1 text-slate-500">{order.shippingAddress?.name}, {order.shippingAddress?.phone}, {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</p><div className="mt-4 grid gap-2">{order.items?.map((item) => <div key={item.id} className="flex justify-between"><span>{item.name} × {item.quantity}</span><b>{formatCurrency(item.price * item.quantity)}</b></div>)}</div></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
