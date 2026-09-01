import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";

const LayoutInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-[72px]" : "md:ml-[280px]"
        }`}
      >
        <Header />
        <main className="flex-1 p-6 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
};
