import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="container-page grid min-h-[75vh] place-items-center py-12">
      <form onSubmit={submit} className="card w-full max-w-md p-6">
        <h1 className="text-3xl font-black">Create account</h1>
        <div className="mt-6 space-y-4">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <button disabled={loading} className="btn-primary w-full">{loading ? "Creating..." : "Register"}</button>
          <button type="button" className="btn-secondary w-full" onClick={google}><FcGoogle /> Continue with Google</button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">Already have an account? <Link className="font-bold text-primary" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
