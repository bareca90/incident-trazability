import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Incidencias & Soluciones", href: "/incidencias", icon: "bug_report" },
    { name: "GestiÃ³n de Usuarios", href: "/usuarios", icon: "group" },
    { name: "Roles y Permisos", href: "/roles", icon: "admin_panel_settings" },
    { name: "Logs de AuditorÃ­a", href: "/audit-logs", icon: "receipt_long" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] z-40 bg-surface border-r border-outline-variant/30 shadow-sm flex flex-col gap-2 p-md hidden md:flex">
      {/* Brand Header */}
      <div className="px-4 py-5 mb-2 border-b border-outline-variant/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">troubleshoot</span>
            <h1 className="font-headline-md text-xl font-bold text-primary tracking-tight">DevTrace</h1>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">Trazabilidad de Incidencias</p>
        </div>
        <span className="bg-primary-container text-on-primary-container text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">
          v1.0
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer rounded-lg ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* User Info Bottom Footer */}
      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-center gap-3 mt-auto">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shadow-inner">
          {user?.nombres?.charAt(0) ?? "U"}{user?.apellidos?.charAt(0) ?? "A"}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-semibold text-sm text-on-surface truncate">{user?.nombres} {user?.apellidos}</p>
          <p className="text-xs text-on-surface-variant truncate">@{user?.username}</p>
        </div>
      </div>
    </nav>
  );
};
