import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiMoon, FiSearch, FiShoppingBag, FiSun, FiUser, FiX } from "react-icons/fi";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { db } from "../firebase/config";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Collections" },
  { to: "/consultation", label: "Consultation" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [isAdmin, setIsAdmin] = useState(false);
  const { currentUser, logout } = useAuth();
  const { count, setIsCartOpen } = useCart();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Check ADMIN collection instead of userRole
  useEffect(() => {
    if (!currentUser) { setIsAdmin(false); return; }
    getDoc(doc(db, "ADMIN", currentUser.uid)).then((snap) => {
      setIsAdmin(snap.exists() && snap.data()?.ADMIN === "ROLE");
    });
  }, [currentUser]);

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 text-primary" : "text-slate-700 hover:bg-slate-100 hover:text-primary dark:text-slate-200 dark:hover:bg-white/10"}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur-xl dark:bg-slate-950/85">
        <div className="rainbow-strip h-1" />
        <nav className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="text-xl font-black tracking-tight">
            Bell<span className="rainbow-text">Boutique</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass}>{link.label}</NavLink>
            ))}
            {isAdmin
              ? <NavLink to="/admin" className={navClass}>Admin</NavLink>
              : <NavLink to="/login" className={navClass}>Login</NavLink>
            }
          </div>
          <div className="flex items-center gap-2">
            <Link to="/shop" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Search collections">
              <FiSearch />
            </Link>
            <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setDark((value) => !value)} aria-label="Toggle dark mode">
              {dark ? <FiSun /> : <FiMoon />}
            </button>
            <button className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <FiShoppingBag />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
            {currentUser ? (
              <Menu as="div" className="relative hidden md:block">
                <Menu.Button className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  {currentUser.photoURL
                    ? <img src={currentUser.photoURL} alt="" className="h-full w-full object-cover" />
                    : <FiUser />
                  }
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 mt-2 w-52 rounded-lg border bg-white p-2 shadow-soft dark:bg-slate-900">
                    <Menu.Item>{({ active }) =>
                      <Link className={`block rounded-lg px-3 py-2 text-sm ${active ? "bg-slate-100 dark:bg-white/10" : ""}`} to="/profile">
                        Profile
                      </Link>
                    }</Menu.Item>
                    {isAdmin && (
                      <Menu.Item>{({ active }) =>
                        <Link className={`block rounded-lg px-3 py-2 text-sm ${active ? "bg-slate-100 dark:bg-white/10" : ""}`} to="/admin">
                          Admin Dashboard
                        </Link>
                      }</Menu.Item>
                    )}
                    <Menu.Item>{({ active }) =>
                      <button className={`w-full rounded-lg px-3 py-2 text-left text-sm text-danger ${active ? "bg-red-50 dark:bg-red-500/10" : ""}`} onClick={logout}>
                        Logout
                      </button>
                    }</Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Link to="/login" className="btn-secondary hidden py-2 md:inline-flex">Login</Link>
            )}
            <button className="grid h-10 w-10 place-items-center rounded-lg md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <FiMenu />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div className="absolute inset-0 bg-slate-950/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside className="absolute right-0 top-0 h-full w-80 max-w-[86vw] bg-white p-5 shadow-soft dark:bg-slate-950" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black">Menu</span>
                <button className="grid h-10 w-10 place-items-center rounded-lg" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <FiX />
                </button>
              </div>
              <div className="mt-8 grid gap-2">
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={navClass}>
                    {link.label}
                  </NavLink>
                ))}
                {isAdmin
                  ? <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={navClass}>Admin</NavLink>
                  : <NavLink to="/login" onClick={() => setMobileOpen(false)} className={navClass}>Login</NavLink>
                }
                {currentUser
                  ? <button className="mt-4 btn-secondary justify-start" onClick={logout}>Logout</button>
                  : <Link className="mt-4 btn-primary" to="/login">Login</Link>
                }
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}