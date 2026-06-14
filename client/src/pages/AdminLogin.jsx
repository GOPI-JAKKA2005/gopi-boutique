import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiLock, FiShield } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      const snapshot = await getDoc(doc(db, "users", user.uid));
      const role = snapshot.exists() ? snapshot.data()?.role : "user";

      if (role !== "admin") {
        await logout();
        toast.error("This account does not have admin access");
        return;
      }

      toast.success("Admin login successful");
      navigate("/admin");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page grid min-h-[75vh] place-items-center py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border bg-white shadow-soft dark:bg-slate-950 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative bg-neutral-950 p-8 text-white">
          <div className="rainbow-strip absolute inset-x-0 top-0 h-2" />
          <FiShield className="mt-8 text-4xl text-yellow-200" />
          <h1 className="mt-5 text-3xl font-black">Admin Login</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Secure access for managing boutique products, orders, users, and dashboard activity.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-white/75">
            <span className="rounded-lg border border-white/15 bg-white/10 p-3">Role checked from Firestore users collection</span>
            <span className="rounded-lg border border-white/15 bg-white/10 p-3">Only accounts with role admin can enter dashboard</span>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8">
          <p className="text-sm font-bold uppercase rainbow-text">Bell Boutique control room</p>
          <h2 className="mt-2 text-3xl font-black">Sign in as administrator</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Admin email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button disabled={loading} className="btn-primary w-full">
              <FiLock /> {loading ? "Checking access..." : "Login to admin"}
            </button>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <Link className="font-bold text-primary" to="/login">Customer login</Link>
            <Link className="font-bold text-primary" to="/">Back to boutique</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
