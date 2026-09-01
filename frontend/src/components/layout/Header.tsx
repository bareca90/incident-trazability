import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa */}
        <button
          id="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all duration-200"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <h2 className="text-lg font-semibold text-on-surface">DevTrace Platform</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-on-surface font-medium">Sistema Activo</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:text-error hover:border-error/30 hover:bg-error-container/20 text-xs font-semibold transition-all duration-200"
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};
