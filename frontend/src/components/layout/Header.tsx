import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export const Header: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa */}
        <button
          id="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <h2 className="text-lg font-semibold text-on-surface">DevTrace Platform</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-on-surface font-medium">Sistema Activo</span>
        </div>

        {/* Dropdown de Usuario */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.nombres?.charAt(0) ?? "U"}{user?.apellidos?.charAt(0) ?? "A"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-on-surface leading-tight">
                {user?.nombres?.split(" ")[0]} {user?.apellidos?.split(" ")[0]}
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight">@{user?.username}</p>
            </div>
            <span className="material-symbols-outlined text-base text-on-surface-variant hidden sm:block">
              {isDropdownOpen ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* Menú flotante */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
                <p className="text-xs font-bold text-on-surface truncate">
                  {user?.nombres} {user?.apellidos}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate font-mono">{user?.email}</p>
                {user?.mustChangePwd && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700">
                    Cambio de clave pendiente
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/cambio-clave");
                }}
                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-primary">key</span>
                <span>Cambiar Contraseña</span>
              </button>

              {(user?.isAdmin || hasPermission("USR_LISTA", "ver")) && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/seguridad/claves");
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-primary">admin_panel_settings</span>
                  <span>Gestión de Claves</span>
                </button>
              )}

              <div className="border-t border-outline-variant/20 my-1"></div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-error hover:bg-error-container/20 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

