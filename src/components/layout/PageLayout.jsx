import React from "react";
import { Topbar } from "./Topbar.jsx";

export const PageLayout = ({ title, subtitle, children, onSearch }) => (
  <div className="space-y-6">
    <Topbar title={title} subtitle={subtitle} onSearch={onSearch} />
    {children}
  </div>
);
