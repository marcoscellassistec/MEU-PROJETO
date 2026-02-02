import React from "react";
import { Link } from "react-router-dom";

export const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
    <h1 className="text-3xl font-semibold">Página não encontrada</h1>
    <Link className="text-brand-600" to="/dashboard">
      Voltar para o Dashboard
    </Link>
  </div>
);
