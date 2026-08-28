import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const { user, hasPermission } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
      visible: true,
    },
    {
      name: "Incidencias & Soluciones",
      href: "/incidencias",
      icon: "bug_report",
      visible: hasPermission("INC_LISTA", "ver"),
    },
    {
      name: "Gestión de Usuarios",
      href: "/usuarios",
      icon: "group",
      visible: hasPermission("USR_LISTA", "ver"),
    },
    {
      name: "Roles y Permisos",
      href: "/roles",
      icon: "admin_panel_settings",
      visible: hasPermission("SEG_ROLES", "ver"),
    },
    {
      name: "Gestión de Menús",
      href: "/menus",
      icon: "menu_open",
      visible: hasPermission("CONF_MENUS", "ver"),
    },
    {
      name: "Sistemas Afectados",
      href: "/sistemas",
      icon: "dns",
      visible: hasPermission("CONF_SISTEMAS", "ver"),
    },
    {
      name: "Logs de Auditoría",
      href: "/audit-logs",
      icon: "receipt_long",
      visible: hasPermission("SEG_BITACORA", "ver"),
    },
  ];

  const visibleNav = navigation.filter((item) => item.visible);

  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] z-40 bg-surface border-r border-outline-variant/30 shadow-sm flex flex-col gap-2 p-4 hidden md:flex">
      {/* Brand Header */}
      <div className="px-3 py-4 mb-2 border-b border-outline-variant/30 flex items-center justify-between">
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
        <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase px-3 py-1 tracking-wider">
          Módulos
        </p>
        {visibleNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer rounded-xl ${
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
          <p className="font-semibold text-xs text-on-surface truncate">
            {user?.nombres} {user?.apellidos}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-on-surface-variant truncate">@{user?.username}</span>
            {user?.isAdmin && (
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
