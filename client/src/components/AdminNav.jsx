import { NavLink } from "react-router-dom";
import { FiBarChart2, FiBox, FiClipboard, FiFileText, FiScissors, FiShoppingCart, FiUsers } from "react-icons/fi";

const links = [
  { to: "/admin", label: "Dashboard", icon: FiBarChart2, end: true },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { to: "/admin/consultations", label: "Consultations", icon: FiScissors },
  { to: "/admin/leads", label: "Leads", icon: FiClipboard },
  { to: "/admin/content", label: "Pages", icon: FiFileText },
  { to: "/admin/users", label: "Users", icon: FiUsers },
];

export default function AdminNav() {
  return (
    <div className="mb-8 overflow-x-auto">
      <nav className="flex min-w-max gap-2 rounded-lg border border-white/70 bg-white/75 p-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  isActive ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-200 dark:hover:bg-white/10"
                }`
              }
            >
              <Icon />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
