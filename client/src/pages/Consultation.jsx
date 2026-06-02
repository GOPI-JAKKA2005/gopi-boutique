import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiCalendar, FiCheckCircle, FiMail, FiMapPin, FiMessageCircle, FiPhone, FiScissors, FiSend } from "react-icons/fi";
import { boutiqueCategories, processSteps } from "../data/boutique";
import { formatCurrency } from "../utils/formatCurrency";
import { useSiteContent } from "../hooks/useSiteContent";
import { createConsultationRequest } from "../firebase/db";

const whatsappUrl = "https://wa.me/916300912517?text=Hi%20Gopi%20Boutique%2C%20I%20want%20to%20book%20an%20appointment.";

const embroideryMultipliers = { Minimal: 1, Standard: 1.28, Premium: 1.62, Bridal: 2.05 };
const baseBudgets = { Women: 22000, Men: 36000, Kids: 9500 };

export default function Consultation() {
  const { content } = useSiteContent("consultation");
  const [saving, setSaving] = useState(false);
  const [brief, setBrief] = useState({
    name: "", phone: "", email: "", outfit: "Women",
    eventDate: "", embroidery: "Standard", fitPriority: "Comfort fit", notes: "",
  });

  const estimate = useMemo(() => {
    const base = baseBudgets[brief.outfit] || 20000;
    return Math.round(base * embroideryMultipliers[brief.embroidery]);
  }, [brief.outfit, brief.embroidery]);

  const update = (field, value) => setBrief((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createConsultationRequest({ ...brief, estimate });
      toast.success("Design brief sent. The studio can confirm the appointment from admin.");
      setBrief((current) => ({ ...current, notes: "" }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="rainbow-strip absolute inset-x-0 top-0 h-2" />
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-yellow-200">{content.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{content.title}</h1>
            <p className="mt-5 max-w-xl leading-7 text-white/70">{content.subtitle}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Body-type fitting", "Premium handwork", "Fabric guidance"].map((item) => (
                <div key={item} className="rounded-lg border border-white/15 bg-white/10 p-4">
                  <FiCheckCircle className="text-yellow-200" />
                  <p className="mt-3 text-sm font-bold">{item}</p>
                </div>
              ))}
            </div>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary mt-8">
              <FiMessageCircle /> Book appointment on WhatsApp
            </a>
          </div>
          <div className="overflow-hidden rounded-lg">
            <img
              src={content.imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"}
              alt="Bridal boutique consultation"
              className="h-full max-h-[520px] w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85";
              }}
            />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="rainbow-panel rainbow-border-top p-6 sm:p-8" onSubmit={submit}>
          <div className="mb-6">
            <p className="text-sm font-bold uppercase rainbow-text">Design brief</p>
            <h2 className="mt-1 text-2xl font-black">Appointment details</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="label">Name</label><input className="input" value={brief.name} onChange={(e) => update("name", e.target.value)} placeholder="Client name" required /></div>
            <div><label className="label">Phone</label><input className="input" value={brief.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 phone number" required /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={brief.email} onChange={(e) => update("email", e.target.value)} placeholder="Email address" /></div>
            <div><label className="label">Event date</label><input className="input" type="date" value={brief.eventDate} onChange={(e) => update("eventDate", e.target.value)} /></div>
            <div>
              <label className="label">Outfit type</label>
              <select className="input" value={brief.outfit} onChange={(e) => update("outfit", e.target.value)}>
                {boutiqueCategories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Handwork level</label>
              <select className="input" value={brief.embroidery} onChange={(e) => update("embroidery", e.target.value)}>
                {Object.keys(embroideryMultipliers).map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Fit priority</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Comfort fit", "Structured fit", "Body contour fit"].map((item) => (
                  <button key={item} type="button" className={`rounded-lg border px-4 py-3 text-sm font-bold ${brief.fitPriority === item ? "border-transparent bg-gradient-to-r from-rose-500 to-violet-600 text-white" : "bg-white dark:bg-white/5"}`} onClick={() => update("fitPriority", item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Inspiration notes</label>
              <textarea className="input min-h-32" value={brief.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Mention saree color, event, sleeve style, neckline, embroidery references, or budget constraints." />
            </div>
          </div>
          <button className="btn-primary mt-6" type="submit" disabled={saving}>
            <FiSend /> {saving ? "Sending..." : "Send consultation request"}
          </button>
        </form>

        <aside className="grid gap-4">
          <div className="rainbow-panel rainbow-border-top p-6">
            <FiScissors className="text-3xl text-primary" />
            <p className="mt-4 text-sm font-bold uppercase text-slate-400">Estimated starting budget</p>
            <p className="mt-2 text-4xl font-black">{formatCurrency(estimate)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">Final pricing is confirmed after fabric, lining, embroidery density, delivery timeline, and fitting complexity are reviewed.</p>
          </div>
          <div className="rainbow-panel p-6">
            <p className="font-bold">Boutique process</p>
            <div className="mt-4 grid gap-3">
              {processSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-black text-white ${["bg-rose-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-blue-500", "bg-violet-600"][index]}`}>{index + 1}</span>
                  <span className="text-sm font-semibold">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rainbow-panel p-6">
            <p className="font-bold">Contact studio</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <a className="flex items-center gap-3 hover:text-primary" href="tel:+916300912517">
                <FiPhone /> +91 63009 12517
              </a>
              <a className="flex items-center gap-3 font-bold text-primary hover:text-accent" href={whatsappUrl} target="_blank" rel="noreferrer">
                <FiMessageCircle /> Book directly on WhatsApp
              </a>
              <a className="flex items-center gap-3 hover:text-primary" href="mailto:gopijakka2005@gmail.com">
                <FiMail /> gopijakka2005@gmail.com
              </a>
              <span className="flex items-center gap-3">
                <FiMapPin /> Narasaraopet, Andhra Pradesh - 522413
              </span>
              <span className="flex items-center gap-3">
                <FiCalendar /> Appointments by confirmation
              </span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}