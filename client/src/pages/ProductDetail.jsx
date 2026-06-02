import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiStar } from "react-icons/fi";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import { getProduct } from "../firebase/db";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";
import { formatCurrency } from "../utils/formatCurrency";
import { sampleProducts } from "../data/boutique";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("Description");
  const { products: related } = useProducts({ category: product?.category || "All", pageSize: 4 });

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then((data) => data || sampleProducts.find((item) => item.id === id))
      .catch(() => sampleProducts.find((item) => item.id === id))
      .then((data) => {
        setProduct(data);
        setActiveImage(data?.imageUrl || data?.images?.[0] || "");
        setLoading(false);
      });
  }, [id]);

  const images = useMemo(() => product ? [...new Set([product.imageUrl, ...(product.images || [])].filter(Boolean))] : [], [product]);
  if (loading) return <Loader />;
  if (!product) return <div className="container-page py-16"><div className="card p-10 text-center">Product not found</div></div>;

  const price = Number(product.discountPrice || product.price);
  const original = Number(product.price);

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid gap-4 md:grid-cols-[96px_1fr]">
          <div className="order-2 flex gap-3 md:order-1 md:flex-col">
            {images.map((image) => (
              <button key={image} className={`aspect-square w-20 overflow-hidden rounded-lg border ${activeImage === image ? "border-primary" : ""}`} onClick={() => setActiveImage(image)}>
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="order-1 overflow-hidden rounded-lg bg-slate-100 md:order-2 dark:bg-white/5">
            <img src={activeImage} alt={product.name} className="h-full min-h-[420px] w-full object-cover transition duration-500 hover:scale-110" />
          </div>
        </div>
        <div>
          <p className="font-bold text-primary">{product.brand}</p>
          <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-warning"><FiStar className="fill-current" /><b>{Number(product.rating || 0).toFixed(1)}</b><span className="text-slate-400">({product.reviewCount || 0} reviews)</span></div>
          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-black">{formatCurrency(price)}</p>
            {original > price && <p className="text-lg text-slate-400 line-through">{formatCurrency(original)}</p>}
            {original > price && <span className="badge bg-accent/10 text-accent">{Math.round(((original - price) / original) * 100)}% off</span>}
          </div>
          <p className={`mt-4 font-semibold ${product.stock > 0 ? "text-success" : "text-danger"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
          <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Delivery", product.deliveryWindow || "Made to order"],
              ["Handwork", product.embroidery || "Custom"],
              ["Fabric", product.fabric || "Designer selected"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border bg-white p-4 dark:bg-white/[0.04]">
                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <button className="grid h-12 w-12 place-items-center" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><FiMinus /></button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <button className="grid h-12 w-12 place-items-center" onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}><FiPlus /></button>
            </div>
            <button disabled={!product.stock} className="btn-primary" onClick={() => addItem(product, quantity)}><FiShoppingBag /> Add to Cart</button>
            <button className="btn-secondary"><FiHeart /> Wishlist</button>
          </div>
          <div className="mt-10">
            <div className="flex border-b">
              {["Description", "Specifications", "Reviews"].map((item) => <button key={item} className={`px-4 py-3 text-sm font-bold ${tab === item ? "border-b-2 border-primary text-primary" : "text-slate-500"}`} onClick={() => setTab(item)}>{item}</button>)}
            </div>
            <div className="py-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {tab === "Description" && product.description}
              {tab === "Specifications" && <ul className="grid gap-2"><li>Designer line: {product.brand}</li><li>Category: {product.category}</li><li>Availability: {product.stock} made-to-order slots</li><li>Delivery window: {product.deliveryWindow || "Confirmed after consultation"}</li><li>Fabric: {product.fabric || "Designer selected"}</li></ul>}
              {tab === "Reviews" && <p>Reviews are synced from Firestore when customers add them.</p>}
            </div>
          </div>
        </div>
      </div>
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-black">Related products</h2><Link to="/shop" className="font-bold text-primary">View shop</Link></div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{related.filter((item) => item.id !== id).slice(0, 4).map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div>
      </section>
    </div>
  );
}
