import React, { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextType {
  /** Visible en mobile como drawer */
  mobileOpen: boolean;
  /** Colapsado en desktop (solo iconos) */
  isCollapsed: boolean;
  /** Alterna el sidebar según el viewport:
   *  - En desktop (md+): colapsa/expande
   *  - En mobile: abre/cierra el drawer
   */
  toggleSidebar: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    // Detecta el breakpoint usando matchMedia
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) {
      setIsCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <SidebarContext.Provider value={{ mobileOpen, isCollapsed, toggleSidebar, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
};
