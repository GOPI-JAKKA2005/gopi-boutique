import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiScissors,
  FiSearch,
  FiX,
} from "react-icons/fi";
import AdminNav from "../../components/AdminNav";
import { db } from "../../firebase/config";
import { updateConsultationStatus } from "../../firebase/db";
import { formatCurrency } from "../../utils/formatCurrency";

const STATUS_CONFIG = {
  new: { label: "New", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", color: "text-blue-600", dot: "bg-blue-500" },
  contacted: { label: "Contacted", bg: "bg-yellow-50 dark:bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-500/20", color: "text-yellow-600", dot: "bg-yellow-500" },
  confirmed: { label: "Confirmed", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", color: "text-purple-600", dot: "bg-purple-500" },
  completed: { label: "Completed", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", color: "text-emerald-600", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/20", color: "text-red-600", dot: "bg-red-500" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

function formatDate(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminConsultations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "consultationRequests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function changeStatus(id, status) {
    setUpdating(id);
    try {
      await updateConsultationStatus(id, status);
      toast.success(`Marked as ${status}`);
      if (selected?.id === id) setSelected((p) => ({ ...p, status }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  }

  const filtered = requests.filter((r) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.phone?.toLowerCase().includes(q) || r.outfit?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = ALL_STATUSES.reduce((acc, s) => { acc[s] = requests.filter((r) => r.status === s).length; return acc; }, {});

  return (
    <div className="container-page py-10">
      <AdminNav />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Consultations</h1>
          <p className="mt-1 text-sm text-slate-500">{requests.length} total requests</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilterStatus("all")} className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${filterStatus === "all" ? "border-transparent bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5"}`}>
          All ({requests.length})
        </button>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "all" : s)} className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${filterStatus === s ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5"}`}>
              {cfg.label} ({counts[s] || 0})
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input w-full pl-9" placeholder="Search by name, email, phone, outfit type..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading consultations...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <FiScissors className="mx-auto text-4xl text-slate-300" />
          <p className="mt-3 font-semibold text-slate-400">No consultation requests found</p>
          <p className="text-sm text-slate-400">{requests.length === 0 ? "Requests will appear here once customers submit the consultation form." : "Try a different search or filter."}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((req) => {
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.new;
            return (
              <div key={req.id} className="card flex flex-col gap-4 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(req)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-violet-500 text-sm font-black text-white">
                      {req.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-bold leading-tight">{req.name || "—"}</p>
                      <p className="text-xs text-slate-400">{req.email || "—"}</p>
                    </div>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><FiScissors className="shrink-0" />{req.outfit || "—"}</span>
                  <span className="flex items-center gap-1.5"><FiCalendar className="shrink-0" />{req.eventDate || "No date"}</span>
                  <span className="flex items-center gap-1.5"><FiPhone className="shrink-0" />{req.phone || "—"}</span>
                  <span className="flex items-center gap-1.5"><FiClock className="shrink-0" />{formatDate(req.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/5">
                  <span className="text-xs text-slate-400">Est. budget</span>
                  <span className="font-black text-primary">{req.estimate ? formatCurrency(req.estimate) : "—"}</span>
                </div>
                {req.notes && <p className="line-clamp-2 text-xs text-slate-400 italic">"{req.notes}"</p>}
                <div className="mt-auto">
                  <select className="input w-full py-2 text-xs" value={req.status || "new"} disabled={updating === req.id} onClick={(e) => e.stopPropagation()} onChange={(e) => changeStatus(req.id, e.target.value)}>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="rainbow-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-violet-500 text-lg font-black text-white">
                  {selected.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-xl font-black">{selected.name}</h2>
                  <p className="text-sm text-slate-400">{selected.email}</p>
                </div>
              </div>
              <button className="btn-secondary py-1.5 text-xs" onClick={() => setSelected(null)}><FiX /> Close</button>
            </div>

            {(() => { const cfg = STATUS_CONFIG[selected.status] || STATUS_CONFIG.new; return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.border} ${cfg.color}`}><span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{cfg.label}</span>; })()}

            <div className="mt-5 grid gap-4">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
                <p className="mb-3 text-xs font-bold uppercase text-slate-400">Contact details</p>
                <div className="grid gap-2 text-sm">
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 font-semibold text-primary hover:underline"><FiPhone />{selected.phone || "—"}</a>
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-slate-600 hover:text-primary dark:text-slate-300"><FiMail />{selected.email || "—"}</a>
                  <a href={`https://wa.me/91${selected.phone?.replace(/\D/g, "")}?text=Hi ${encodeURIComponent(selected.name)}, this is Gopi Boutique regarding your consultation request.`} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-emerald-600 hover:underline">
                    <FiMessageCircle /> WhatsApp {selected.name?.split(" ")[0]}
                  </a>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
                <p className="mb-3 text-xs font-bold uppercase text-slate-400">Outfit requirements</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-slate-400">Outfit type</p><p className="font-semibold">{selected.outfit || "—"}</p></div>
                  <div><p className="text-xs text-slate-400">Handwork level</p><p className="font-semibold">{selected.embroidery || "—"}</p></div>
                  <div><p className="text-xs text-slate-400">Fit priority</p><p className="font-semibold">{selected.fitPriority || "—"}</p></div>
                  <div><p className="text-xs text-slate-400">Event date</p><p className="font-semibold">{selected.eventDate || "No date set"}</p></div>
                  <div><p className="text-xs text-slate-400">Est. budget</p><p className="font-black text-primary">{selected.estimate ? formatCurrency(selected.estimate) : "—"}</p></div>
                  <div><p className="text-xs text-slate-400">Submitted</p><p className="font-semibold">{formatDate(selected.createdAt)}</p></div>
                </div>
              </div>

              {selected.notes && (
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
                  <p className="mb-2 text-xs font-bold uppercase text-slate-400">Inspiration notes</p>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-bold uppercase text-slate-400">Update status</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ALL_STATUSES.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const active = selected.status === s;
                    return (
                      <button key={s} disabled={active || updating === selected.id} onClick={() => changeStatus(selected.id, s)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${active ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5"}`}>
                        {active && <FiCheck className="inline mr-1" />}{cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}