import React from "react";
import { Sidebar } from "./Sidebar.jsx";
import { BottomNav } from "./BottomNav.jsx";

export const AppShell = ({ children }) => (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar />
    <main className="flex-1 px-6 pb-24 pt-8 lg:px-10">
      {children}
    </main>
    <BottomNav />
  </div>
);
