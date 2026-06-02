import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { FiCalendar, FiChevronDown, FiClock, FiEdit2, FiLogOut, FiPhone, FiPlus, FiScissors, FiTrash2, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../hooks/useOrders";
import { db } from "../firebase/config";
import { formatCurrency } from "../utils/formatCurrency";

const statusColors = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-primary/10 text-primary",
  shipped: "bg-blue-500/10 text-blue-500",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

const CONSULTATION_STATUS = {
  new: { label: "Pending Review", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", color: "text-blue-600", dot: "bg-blue-500" },
  contacted: { label: "Studio Contacted You", bg: "bg-yellow-50 dark:bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-500/20", color: "text-yellow-600", dot: "bg-yellow-500" },
  confirmed: { label: "Appointment Confirmed ✓", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", color: "text-emerald-600", dot: "bg-emerald-500" },
  completed: { label: "Completed", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", color: "text-purple-600", dot: "bg-purple-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/20", color: "text-red-600", dot: "bg-red-500" },
};

const emptyAddress = { name: "", phone: "", address: "", city: "", pincode: "" };

function formatDate(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Profile() {
  const { currentUser, userProfile, updateProfileData, logout } = useAuth();
  const { orders } = useOrders(currentUser?.uid);
  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || "");
  const [openOrder, setOpenOrder] = useState("");
  const [consultations, setConsultations] = useState([]);

  // Address management
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState(emptyAddress);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);

  useEffect(() => {
    if (!currentUser?.email) return;
    const q = query(
      collection(db, "consultationRequests"),
      where("email", "==", currentUser.email)
    );
    const unsub = onSnapshot(q, (snap) => {
      setConsultations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  const addresses = userProfile?.addresses || [];

  function deleteAddress(index) {
    const updated = addresses.filter((_, i) => i !== index);
    updateProfileData({ addresses: updated });
  }

  function startEdit(index) {
    setEditingIndex(index);
    setEditForm({ ...addresses[index] });
  }

  function saveEdit() {
    const updated = addresses.map((addr, i) => i === editingIndex ? editForm : addr);
    updateProfileData({ addresses: updated });
    setEditingIndex(null);
  }

  function addAddress() {
    if (!newAddress.name || !newAddress.address || !newAddress.city || !newAddress.pincode) return;
    updateProfileData({ addresses: [...addresses, newAddress] });
    setNewAddress(emptyAddress);
    setShowAddForm(false);
  }

  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Sidebar */}
        <aside className="card h-max p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-slate-100 text-2xl font-black dark:bg-white/10">
              {userProfile?.photoURL
                ? <img src={userProfile.photoURL} alt="" className="h-full w-full object-cover" />
                : name?.[0] || "U"
              }
            </div>
            <div>
              <h1 className="text-2xl font-black">{userProfile?.name || "Profile"}</h1>
              <p className="text-sm text-slate-500">{currentUser.email}</p>
            </div>
          </div>
          <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10">
            Profile photos are managed by the boutique team. Customers can update name and order details only.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <button className="btn-primary w-full" onClick={() => updateProfileData({ name })}>
              Save changes
            </button>
            <button className="btn-secondary w-full text-danger" onClick={logout}>
              <FiLogOut /> Logout
            </button>
          </div>

          {/* Saved Addresses */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Saved addresses</h2>
              <button
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <FiPlus /> Add new
              </button>
            </div>

            {/* Add new address form */}
            {showAddForm && (
              <div className="mt-3 rounded-lg border p-3 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">New address</p>
                {["name", "phone", "address", "city", "pincode"].map((field) => (
                  <input
                    key={field}
                    className="input py-2 text-sm"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={newAddress[field]}
                    onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                  />
                ))}
                <div className="flex gap-2">
                  <button className="btn-primary flex-1 py-2 text-xs" onClick={addAddress}>Save</button>
                  <button className="btn-secondary py-2 text-xs" onClick={() => setShowAddForm(false)}><FiX /></button>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-3">
              {addresses.length === 0 ? (
                <p className="text-sm text-slate-500">No saved addresses yet.</p>
              ) : (
                addresses.map((address, index) => (
                  <div key={index} className="rounded-lg border p-3 text-sm">
                    {editingIndex === index ? (
                      <div className="space-y-2">
                        {["name", "phone", "address", "city", "pincode"].map((field) => (
                          <input
                            key={field}
                            className="input py-2 text-sm"
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={editForm[field]}
                            onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                          />
                        ))}
                        <div className="flex gap-2">
                          <button className="btn-primary flex-1 py-2 text-xs" onClick={saveEdit}>Save</button>
                          <button className="btn-secondary py-2 text-xs" onClick={() => setEditingIndex(null)}><FiX /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="leading-5">
                          {address.name}, {address.address}, {address.city} - {address.pincode}
                        </p>
                        <div className="flex shrink-0 gap-1">
                          <button
                            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                            onClick={() => startEdit(index)}
                          >
                            <FiEdit2 className="text-xs" />
                          </button>
                          <button
                            className="grid h-7 w-7 place-items-center rounded-lg text-danger hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => deleteAddress(index)}
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="grid gap-6">
          {/* Consultations */}
          <div className="card p-6">
            <div className="mb-5 flex items-center gap-3">
              <FiScissors className="text-xl text-primary" />
              <h2 className="text-2xl font-black">My Consultations</h2>
            </div>
            {consultations.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-6 text-center dark:bg-white/5">
                <FiScissors className="mx-auto text-3xl text-slate-300" />
                <p className="mt-3 font-semibold text-slate-400">No consultation requests yet</p>
                <a href="/consultation" className="btn-primary mt-4 inline-flex">Book a consultation</a>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((req) => {
                  const cfg = CONSULTATION_STATUS[req.status] || CONSULTATION_STATUS.new;
                  return (
                    <div key={req.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{req.outfit} outfit</p>
                          <p className="text-sm text-slate-500">{req.embroidery} · {req.fitPriority}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-3">
                        <span className="flex items-center gap-1.5"><FiCalendar className="shrink-0" /> Event: {req.eventDate || "Not set"}</span>
                        <span className="flex items-center gap-1.5"><FiClock className="shrink-0" /> Submitted: {formatDate(req.createdAt)}</span>
                        <span className="flex items-center gap-1.5"><FiPhone className="shrink-0" /> {req.phone}</span>
                      </div>
                      {req.notes && (
                        <p className="mt-3 rounded-lg bg-white/60 p-3 text-xs text-slate-500 dark:bg-white/5">"{req.notes}"</p>
                      )}
                      {req.status === "confirmed" && (
                        <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          🎉 Your appointment is confirmed! The studio will contact you on {req.phone} to finalize the schedule.
                        </div>
                      )}
                      {req.status === "cancelled" && (
                        <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm font-semibold text-red-600 dark:text-red-400">
                          This consultation was cancelled. Feel free to book a new one.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="card p-6">
            <h2 className="text-2xl font-black">My Orders</h2>
            <div className="mt-5 space-y-4">
              {orders.length === 0 ? (
                <p className="text-slate-500">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-lg border">
                    <button
                      className="flex w-full items-center justify-between gap-4 p-4 text-left"
                      onClick={() => setOpenOrder(openOrder === order.id ? "" : order.id)}
                    >
                      <div>
                        <p className="font-bold">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-slate-500">{order.items?.length || 0} items · {formatCurrency(order.totalAmount)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusColors[order.status] || statusColors.pending}`}>{order.status}</span>
                        <FiChevronDown />
                      </div>
                    </button>
                    {openOrder === order.id && (
                      <div className="border-t p-4 text-sm">
                        <div className="grid gap-2">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.name} × {item.quantity}</span>
                              <b>{formatCurrency(item.price * item.quantity)}</b>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}