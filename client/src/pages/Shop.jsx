import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { FiCalendar, FiFilter, FiSearch, FiX } from "react-icons/fi";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { useProducts } from "../hooks/useProducts";
import { useSiteContent } from "../hooks/useSiteContent";
import { boutiqueBrands, boutiqueCategories } from "../data/boutique";
import { formatCurrency } from "../utils/formatCurrency";

const budgetBands = [
  { label: "All budgets", value: 100000 },
  { label: "Under 15k", value: 15000 },
  { label: "Under 30k", value: 30000 },
  { label: "Under 50k", value: 50000 },
  { label: "Luxury edit", value: 100000 },
];

export default function Shop() {
  const [params] = useSearchParams();
  const { content } = useSiteContent("shop");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [brand, setBrand] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [rating, setRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [open, setOpen] = useState(false);
  const { products, loading } = useProducts({ category, search: debounced, sortBy, pageSize: 48 });

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => products.filter((product) => {
    const price = Number(product.discountPrice || product.price || 0);
    return (brand === "All" || product.brand === brand) && Number(product.rating || 0) >= rating && price <= maxPrice;
  }), [products, brand, rating, maxPrice]);

  const filters = (
    <div className="space-y-6">
      <div>
        <label className="label">Outfit category</label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {boutiqueCategories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Designer line</label>
        <select className="input" value={brand} onChange={(e) => setBrand(e.target.value)}>
          {boutiqueBrands.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Budget: {formatCurrency(maxPrice)}</label>
        <input className="w-full accent-primary" type="range" min="500" max="100000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {budgetBands.map((band) => (
            <button key={band.label} type="button" className={`rounded-lg border px-3 py-2 text-xs font-bold ${maxPrice === band.value ? "border-transparent bg-gradient-to-r from-rose-500 to-violet-600 text-white" : "bg-white text-slate-600 dark:bg-white/5 dark:text-slate-200"}`} onClick={() => setMaxPrice(band.value)}>
              {band.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Minimum rating</label>
        <select className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[0, 3, 4, 4.5].map((item) => <option value={item} key={item}>{item ? `${item}+ stars` : "Any rating"}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="container-page py-10">
      <div className="rainbow-panel rainbow-border-top p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase rainbow-text">{content.eyebrow}</p>
            <h1 className="text-4xl font-black">{content.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {content.subtitle}
            </p>
          </div>
          <Link to="/consultation" className="btn-primary shrink-0"><FiCalendar /> Appointment</Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-bold uppercase rainbow-text">Search studio</p><h2 className="text-2xl font-black">Find a style direction</h2></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10 sm:w-80" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search women, men, kids" />
          </div>
          <select className="input sm:w-44" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="priceAsc">Price low to high</option>
            <option value="priceDesc">Price high to low</option>
            <option value="rating">Top rated</option>
          </select>
          <button className="btn-secondary md:hidden" onClick={() => setOpen(true)}><FiFilter /> Filters</button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block"><div className="rainbow-panel rainbow-border-top sticky top-24 p-5">{filters}</div></aside>
        <main>
          {loading ? <Loader /> : filtered.length === 0 ? (
            <div className="card p-10 text-center"><p className="text-lg font-bold">No boutique styles found</p><p className="mt-1 text-sm text-slate-500">Try relaxing a filter or book a custom consultation.</p></div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <span>{filtered.length} styles available for customization</span>
                <span>Made-to-order pricing varies with fabric and handwork.</span>
              </div>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                {filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
              </div>
            </>
          )}
        </main>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50 lg:hidden">
        <div className="fixed inset-0 bg-slate-950/50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 w-80 max-w-[86vw] bg-white p-5 dark:bg-slate-950">
          <div className="mb-6 flex items-center justify-between"><Dialog.Title className="font-bold">Filters</Dialog.Title><button onClick={() => setOpen(false)}><FiX /></button></div>
          {filters}
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
