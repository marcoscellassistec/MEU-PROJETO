import React from "react";
import { Button } from "../ui/Button.jsx";
import { Dropdown } from "../ui/Dropdown.jsx";
import { useAuth } from "../../hooks/useAuth.jsx";

export const Topbar = ({ title, subtitle, onSearch }) => {
  const { signOut, user } = useAuth();

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:w-80">
          <input
            type="search"
            placeholder="Buscar cliente ou OS..."
            onChange={(event) => onSearch?.(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
          />
          <span className="absolute right-4 top-2.5 text-xs text-slate-400">/</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onSearch?.("nova-os")}>Nova OS</Button>
          <Button onClick={() => onSearch?.("nova-venda")}>Nova Venda</Button>
        </div>
        <Dropdown
          label={user?.name || "Conta"}
          items={[{ label: "Sair", onClick: signOut }]}
        />
      </div>
    </header>
  );
};
