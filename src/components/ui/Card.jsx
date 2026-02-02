import React from "react";

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white p-5 shadow-soft ${className}`}>{children}</div>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-start justify-between gap-4">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);
