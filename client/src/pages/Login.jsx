import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FiShield, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";

export default function Login() {
  const { login, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const redirect = location.state?.from?.pathname || "/";

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);

      if (mode === "admin") {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        const role = snapshot.exists() ? snapshot.data()?.role : "user";

        if (role !== "admin") {
          await logout();
          toast.error("This account does not have admin access");
          return;
        }

        toast.success("Admin login successful");
        navigate("/admin");
        return;
      }

      toast.success("Welcome back");
      navigate(redirect === "/admin" ? "/" : redirect);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    try {
      await loginWithGoogle();
      navigate(redirect);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="container-page grid min-h-[75vh] place-items-center py-12">
      <form onSubmit={submit} className="rainbow-panel rainbow-border-top w-full max-w-md p-6">
        <p className="text-sm font-bold uppercase rainbow-text">Bell Boutique login</p>
        <h1 className="mt-2 text-3xl font-black">{mode === "admin" ? "Admin access" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "admin" ? "Login with an admin account to manage products, orders, and users." : "Login as a customer to shop collections and book consultations."}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-white/10">
          <button type="button" className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${mode === "user" ? "bg-white text-primary shadow-sm dark:bg-slate-950" : "text-slate-500"}`} onClick={() => setMode("user")}>
            <FiUser /> User
          </button>
          <button type="button" className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${mode === "admin" ? "bg-white text-primary shadow-sm dark:bg-slate-950" : "text-slate-500"}`} onClick={() => setMode("admin")}>
            <FiShield /> Admin
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : mode === "admin" ? "Login as admin" : "Login as user"}</button>
          {mode === "user" && <button type="button" className="btn-secondary w-full" onClick={google}><FcGoogle /> Continue with Google</button>}
        </div>
        <div className="mt-5 grid gap-3 text-center text-sm text-slate-500">
          <p>New here? <Link className="font-bold text-primary" to="/register">Create an account</Link></p>
          <p>Admin page also works at <Link className="font-bold text-primary" to="/admin/login">/admin/login</Link></p>
        </div>
      </form>
    </div>
  );
}
