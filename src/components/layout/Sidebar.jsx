import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/clientes", label: "Clientes" },
  { to: "/os", label: "Ordens de Serviço" },
  { to: "/vendas", label: "Vendas" },
  { to: "/financeiro", label: "Financeiro" },
  { to: "/caixa", label: "Caixa" },
  { to: "/configuracoes", label: "Configurações" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden h-screen flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-600 px-3 py-2 text-white">AO</div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">Assistec OS</p>
              <p className="text-xs text-slate-500">Gestão premium</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-lg border border-slate-200 p-2 text-xs text-slate-500 hover:bg-slate-100"
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            {collapsed ? link.label.slice(0, 2) : link.label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Plano ativo</p>
        <p className="text-sm font-semibold">Assistec Pro</p>
      </div>
    </aside>
  );
};
