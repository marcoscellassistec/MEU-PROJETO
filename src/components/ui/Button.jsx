import React from "react";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
};

export const Button = ({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
