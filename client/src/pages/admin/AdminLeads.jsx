import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import toast from "react-hot-toast";
import AdminNav from "../../components/AdminNav";
import { db } from "../../firebase/config";
import { updateConsultationStatus } from "../../firebase/db";
import { formatCurrency } from "../../utils/formatCurrency";

const statuses = ["new", "contacted", "confirmed", "completed", "cancelled"];

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "consultationRequests"), orderBy("createdAt", "desc")),
        (snapshot) => setLeads(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => setLeads([]),
      ),
    [],
  );

  const filtered = filter === "all" ? leads : leads.filter((lead) => lead.status === filter);

  async function changeStatus(id, status) {
    await updateConsultationStatus(id, status);
    toast.success("Lead status updated");
  }

  return (
    <div className="container-page py-10">
      <AdminNav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase rainbow-text">Consultation pipeline</p>
          <h1 className="text-4xl font-black">Leads</h1>
        </div>
        <select className="input max-w-xs" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-white/5">
            <tr>
              <th className="p-4">Client</th>
              <th className="p-4">Outfit</th>
              <th className="p-4">Event</th>
              <th className="p-4">Estimate</th>
              <th className="p-4">Status</th>
              <th className="p-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-t align-top dark:border-white/10">
                <td className="p-4">
                  <b>{lead.name}</b>
                  <p className="mt-1 text-slate-500">{lead.phone}</p>
                  <p className="text-slate-500">{lead.email || "-"}</p>
                </td>
                <td className="p-4">
                  <b>{lead.outfit}</b>
                  <p className="mt-1 text-slate-500">{lead.embroidery} handwork</p>
                  <p className="text-slate-500">{lead.fitPriority}</p>
                </td>
                <td className="p-4">{lead.eventDate || "-"}</td>
                <td className="p-4 font-bold">{formatCurrency(lead.estimate || 0)}</td>
                <td className="p-4">
                  <select className="input min-w-36 py-2" value={lead.status} onChange={(event) => changeStatus(lead.id, event.target.value)}>
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="max-w-sm p-4 text-slate-500">{lead.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No consultation leads found.</div>}
      </div>
    </div>
  );
}

