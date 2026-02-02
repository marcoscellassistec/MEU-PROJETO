import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Home" },
  { to: "/clientes", label: "Clientes" },
  { to: "/os", label: "OS" },
  { to: "/financeiro", label: "Financeiro" },
  { to: "/configuracoes", label: "Config" },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-slate-200 bg-white py-3 text-xs text-slate-500 lg:hidden">
    {links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? "text-brand-600" : "text-slate-500"
          }`
        }
      >
        <span className="h-2 w-2 rounded-full bg-current"></span>
        {link.label}
      </NavLink>
    ))}
  </nav>
);
