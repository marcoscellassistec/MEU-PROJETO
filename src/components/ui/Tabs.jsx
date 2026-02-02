import React, { useState } from "react";

export const Tabs = ({ tabs, onChange }) => {
  const [active, setActive] = useState(tabs[0]?.value ?? "");

  const handleChange = (value) => {
    setActive(value);
    onChange?.(value);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => handleChange(tab.value)}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            active === tab.value
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
