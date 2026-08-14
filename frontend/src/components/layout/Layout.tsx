import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-on-background flex">
      <Sidebar />
      <div className="flex-1 md:ml-[280px] flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
