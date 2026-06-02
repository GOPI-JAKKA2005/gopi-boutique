import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="card max-w-xl p-10 text-center">
        <motion.div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-success text-5xl font-black text-white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}>✓</motion.div>
        <h1 className="mt-6 text-3xl font-black">Order placed successfully</h1>
        <p className="mt-3 text-slate-500">Order ID: <span className="font-mono font-bold text-slate-900 dark:text-white">{params.get("orderId") || "processing"}</span></p>
        <Link to="/shop" className="btn-primary mt-8">Continue Shopping</Link>
      </div>
    </div>
  );
}
