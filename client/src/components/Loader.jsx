import { motion } from "framer-motion";

export default function Loader({ label = "Loading" }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-5">
      <div className="relative grid h-20 w-20 place-items-center">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/15 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border-4 border-accent/15 border-b-accent"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.35, repeat: Infinity, ease: "linear" }}
        />
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-sm font-black text-primary shadow-sm dark:bg-slate-950">GB</span>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</p>
        <div className="mt-2 flex justify-center gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
