import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  FiActivity,
  FiAlertTriangle,
  FiBox,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiMessageCircle,
  FiMousePointer,
  FiPlus,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import AdminNav from "../../components/AdminNav";
import { useProducts } from "../../hooks/useProducts";
import { useOrders } from "../../hooks/useOrders";
import { formatCurrency } from "../../utils/formatCurrency";
import { db } from "../../firebase/config";

function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  return value instanceof Date ? value : new Date(value);
}

function lastDays(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - index - 1));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      orders: 0,
      revenue: 0,
      clicks: 0,
      chats: 0,
    };
  });
}

function dayKey(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function MetricCard({ title, value, Icon, tone, caption }) {
  return (
    <div className="card rainbow-border-top p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-lg ${tone}`}>
        <Icon />
      </span>
      <p className="mt-5 text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      {caption && <p className="mt-2 text-xs font-semibold text-slate-400">{caption}</p>}
    </div>
  );
}

function Sparkline({ data }) {
  const max = Math.max(...data.map((item) => item.revenue), 1);
  const points = data.map((item, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * 300;
    const y = 104 - (item.revenue / max) * 88;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 300 120" className="h-40 w-full overflow-visible">
      <defs>
        <linearGradient id="salesLine" x1="0" x2="1">
          <stop offset="0%" stopColor="#B8325A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <polyline points={points.join(" ")} fill="none" stroke="url(#salesLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((item, index) => {
        const [x, y] = points[index].split(",");
        return <circle key={item.key} cx={x} cy={y} r="5" fill="#fff" stroke="#B8325A" strokeWidth="3" />;
      })}
    </svg>
  );
}

function CategoryBars({ products }) {
  const totals = products.reduce((acc, product) => {
    const category = product.category || "Other";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(totals);
  const max = Math.max(...entries.map(([, total]) => total), 1);

  return (
    <div className="space-y-4">
      {entries.map(([category, total]) => (
        <div key={category}>
          <div className="mb-1 flex justify-between text-sm font-bold">
            <span>{category}</span>
            <span>{total}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-primary via-warning to-accent" style={{ width: `${(total / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { products } = useProducts({ pageSize: 100, includeInactive: true });
  const { orders } = useOrders();
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(
    () =>
      onSnapshot(
        collection(db, "users"),
        (snapshot) => setUsers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => setUsers([]),
      ),
    [],
  );

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "chatLogs"), orderBy("createdAt", "desc"), limit(80)),
        (snapshot) => setChats(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => setChats([]),
      ),
    [],
  );

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "clickEvents"), orderBy("createdAt", "desc"), limit(120)),
        (snapshot) => setClicks(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => setClicks([]),
      ),
    [],
  );

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "consultationRequests"), orderBy("createdAt", "desc"), limit(80)),
        (snapshot) => setLeads(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => setLeads([]),
      ),
    [],
  );

  const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const activeProducts = products.filter((product) => product.status !== "draft" && Number(product.stock || 0) > 0);
  const lowStock = products.filter((product) => Number(product.stock || 0) <= 5);

  const daily = useMemo(() => {
    const days = lastDays(7);
    const byKey = Object.fromEntries(days.map((day) => [day.key, day]));

    orders.forEach((order) => {
      const key = dayKey(order.createdAt);
      if (!byKey[key] || order.status === "cancelled") return;
      byKey[key].orders += 1;
      byKey[key].revenue += Number(order.totalAmount || 0);
    });

    clicks.forEach((event) => {
      const key = dayKey(event.createdAt);
      if (byKey[key]) byKey[key].clicks += 1;
    });

    chats.forEach((event) => {
      const key = dayKey(event.createdAt);
      if (byKey[key]) byKey[key].chats += 1;
    });

    return days;
  }, [orders, clicks, chats]);

  const cards = [
    ["Active Products", activeProducts.length, FiBox, "bg-primary/10 text-primary", `${products.length} total posts`],
    ["Orders", orders.length, FiShoppingCart, "bg-accent/10 text-accent", "All customer orders"],
    ["Users", users.length, FiUsers, "bg-success/10 text-success", "Registered accounts"],
    ["Revenue", formatCurrency(revenue), FiDollarSign, "bg-warning/10 text-warning", "Non-cancelled orders"],
    ["Leads", leads.length, FiClipboard, "bg-rose-500/10 text-rose-500", "Latest consultation briefs"],
    ["Chat Logs", chats.length, FiMessageCircle, "bg-blue-500/10 text-blue-500", "Latest 80 events"],
    ["Tracked Clicks", clicks.length, FiMousePointer, "bg-violet-500/10 text-violet-500", "Latest 120 events"],
  ];

  return (
    <div className="container-page py-10">
      <AdminNav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Admin control room</p>
          <h1 className="text-4xl font-black">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/content" className="btn-secondary">
            <FiFileText /> Manage pages
          </Link>
          <Link to="/admin/products/add" className="btn-primary">
            <FiPlus /> Add product
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, value, Icon, tone, caption]) => (
          <MetricCard key={title} title={title} value={value} Icon={Icon} tone={tone} caption={caption} />
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase rainbow-text">Daily ongoing products</p>
              <h2 className="text-2xl font-black">Revenue and activity graph</h2>
            </div>
            <FiTrendingUp className="text-2xl text-primary" />
          </div>
          <Sparkline data={daily} />
          <div className="grid gap-3 sm:grid-cols-7">
            {daily.map((day) => (
              <div key={day.key} className="rounded-lg bg-slate-50 p-3 text-center dark:bg-white/5">
                <p className="text-xs font-bold text-slate-400">{day.label}</p>
                <p className="mt-1 text-sm font-black">{formatCurrency(day.revenue)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{day.orders} orders</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2">
            <FiActivity className="text-primary" />
            <h2 className="text-2xl font-black">Engagement</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {daily.map((day) => {
              const max = Math.max(...daily.map((item) => item.clicks + item.chats), 1);
              const total = day.clicks + day.chats;
              return (
                <div key={day.key} className="grid grid-cols-[44px_1fr_48px] items-center gap-3 text-sm">
                  <span className="font-bold text-slate-500">{day.label}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600" style={{ width: `${(total / max) * 100}%` }} />
                  </div>
                  <span className="text-right font-black">{total}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="card overflow-hidden">
          <div className="border-b p-5 dark:border-white/10">
            <h2 className="text-xl font-black">Recent orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-white/5">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id} className="border-t dark:border-white/10">
                    <td className="p-4 font-mono">{order.id.slice(0, 8)}</td>
                    <td className="p-4">{order.userName || order.userEmail}</td>
                    <td className="p-4 font-bold">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-4">
                      <span className="badge bg-primary/10 text-primary">{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="grid gap-5">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-warning" />
              <h2 className="text-xl font-black">Low stock</h2>
            </div>
            <div className="mt-4 space-y-3">
              {lowStock.length === 0 ? (
                <p className="text-sm text-slate-500">All inventory looks healthy.</p>
              ) : (
                lowStock.map((product) => (
                  <div key={product.id} className="flex justify-between rounded-lg border p-3 text-sm dark:border-white/10">
                    <span>{product.name}</span>
                    <b className="text-warning">{product.stock}</b>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="text-xl font-black">Category mix</h2>
            <div className="mt-5">
              <CategoryBars products={products} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
