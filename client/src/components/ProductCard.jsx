import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const price = Number(product.discountPrice || product.price || 0);
  const original = Number(product.price || 0);
  const hasDiscount = original > price;

  return (
    <motion.article
      className="group rainbow-panel rainbow-border-top overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.035 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-white/5">
        <img
          src={product.imageUrl || product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <span className="badge absolute left-3 top-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white">
            {Math.round(((original - price) / original) * 100)}% off
          </span>
        )}
        <button type="button" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-700 shadow transition hover:text-accent dark:bg-slate-950/80 dark:text-white" aria-label="Save style">
          <FiHeart />
        </button>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide rainbow-text">{product.brand || product.category}</p>
          <Link to={`/product/${product.id}`} className="mt-1 line-clamp-2 min-h-11 text-base font-bold text-slate-950 hover:text-primary dark:text-white">
            {product.name}
          </Link>
          <p className="mt-1 text-xs font-semibold text-slate-400">{product.deliveryWindow || "Made to order"}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-warning">
          <FiStar className="fill-current" />
          <span className="font-semibold">{Number(product.rating || 0).toFixed(1)}</span>
          <span className="text-slate-400">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-extrabold text-slate-950 dark:text-white">{formatCurrency(price)}</p>
            {hasDiscount && <p className="text-sm text-slate-400 line-through">{formatCurrency(original)}</p>}
          </div>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-rose-500 via-orange-400 to-violet-600 text-white transition hover:-translate-y-0.5"
            aria-label={`Add ${product.name} to cart`}
          >
            <FiShoppingBag />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
