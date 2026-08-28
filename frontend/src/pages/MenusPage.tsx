import React, { useState, useEffect, useMemo } from "react";
import { menuService } from "../services/api";
import { Menu, MenuOption } from "../types";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";

export const MenusPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [options, setOptions] = useState<MenuOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tree" | "options" | "menus">("tree");

  // Filtros y búsquedas
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenuFilter, setSelectedMenuFilter] = useState<string>("all");

  // Modales
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<MenuOption | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Formulario Opción
  const [optionForm, setOptionForm] = useState({
    menuId: 0,
    codigo: "",
    nombre: "",
    descripcion: "",
    ruta: "",
    icono: "smart_button",
    orden: 1,
    activo: true,
  });

  // Formulario Menú
  const [menuForm, setMenuForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    icono: "folder",
    orden: 1,
    activo: true,
  });

  // Notificación / Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [menusRes, optionsRes] = await Promise.all([
        menuService.getAllMenus(),
        menuService.getAllOptions(),
      ]);
      if (menusRes.success) setMenus(menusRes.data);
      if (optionsRes.success) setOptions(optionsRes.data);
    } catch (err: any) {
      showFeedback("error", err.response?.data?.error?.message || "Error al cargar la información de menús");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers para Opciones
  const handleOpenCreateOption = (preselectedMenuId?: number) => {
    setEditingOption(null);
    setOptionForm({
      menuId: preselectedMenuId || (menus.length > 0 ? menus[0].id : 0),
      codigo: "",
      nombre: "",
      descripcion: "",
      ruta: "",
      icono: "article",
      orden: (options.length + 1) * 1,
      activo: true,
    });
    setIsOptionModalOpen(true);
  };

  const handleOpenEditOption = (opt: MenuOption) => {
    setEditingOption(opt);
    setOptionForm({
      menuId: opt.menuId,
      codigo: opt.codigo,
      nombre: opt.nombre,
      descripcion: opt.descripcion || "",
      ruta: opt.ruta || "",
      icono: opt.icono || "article",
      orden: opt.orden,
      activo: opt.activo,
    });
    setIsOptionModalOpen(true);
  };

  const handleSaveOption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!optionForm.menuId) {
        showFeedback("error", "Debes seleccionar un menú padre.");
        return;
      }

      if (editingOption) {
        await menuService.updateOption(editingOption.id, optionForm);
        showFeedback("success", `Opción "${optionForm.nombre}" actualizada correctamente.`);
      } else {
        await menuService.createOption(optionForm);
        showFeedback("success", `Opción "${optionForm.nombre}" registrada correctamente.`);
      }
      setIsOptionModalOpen(false);
      await fetchData();
      await refreshUser();
    } catch (err: any) {
      showFeedback("error", err.response?.data?.error?.message || "Error al guardar la opción de menú");
    }
  };

  const handleDeleteOption = async (opt: MenuOption) => {
    if (!window.confirm(`¿Estás seguro de eliminar la opción de pantalla "${opt.nombre}" (${opt.codigo})?`)) return;
    try {
      await menuService.deleteOption(opt.id);
      showFeedback("success", `Opción "${opt.nombre}" eliminada.`);
      await fetchData();
      await refreshUser();
    } catch (err: any) {
      showFeedback("error", err.response?.data?.error?.message || "Error al eliminar la opción");
    }
  };

  // Handlers para Menús
  const handleOpenCreateMenu = () => {
    setEditingMenu(null);
    setMenuForm({
      codigo: "",
      nombre: "",
      descripcion: "",
      icono: "folder",
      orden: (menus.length + 1) * 1,
      activo: true,
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setMenuForm({
      codigo: menu.codigo,
      nombre: menu.nombre,
      descripcion: menu.descripcion || "",
      icono: menu.icono || "folder",
      orden: menu.orden,
      activo: menu.activo,
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await menuService.updateMenu(editingMenu.id, menuForm);
        showFeedback("success", `Menú "${menuForm.nombre}" actualizado.`);
      } else {
        await menuService.createMenu(menuForm);
        showFeedback("success", `Menú "${menuForm.nombre}" creado.`);
      }
      setIsMenuModalOpen(false);
      await fetchData();
      await refreshUser();
    } catch (err: any) {
      showFeedback("error", err.response?.data?.error?.message || "Error al guardar el menú");
    }
  };

  const handleDeleteMenu = async (menu: Menu) => {
    if (!window.confirm(`¿Estás seguro de eliminar el módulo "${menu.nombre}"? Esto eliminará también todas sus opciones de pantalla asociadas.`)) return;
    try {
      await menuService.deleteMenu(menu.id);
      showFeedback("success", `Módulo "${menu.nombre}" eliminado.`);
      await fetchData();
      await refreshUser();
    } catch (err: any) {
      showFeedback("error", err.response?.data?.error?.message || "Error al eliminar el menú");
    }
  };

  // Filtrado de opciones
  const filteredOptions = useMemo(() => {
    return options.filter((opt) => {
      const matchesSearch =
        opt.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.ruta && opt.ruta.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMenu = selectedMenuFilter === "all" || opt.menuId.toString() === selectedMenuFilter;
      return matchesSearch && matchesMenu;
    });
  }, [options, searchQuery, selectedMenuFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">menu_open</span>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Gestión de Menús y Pantallas</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Consulta, registra y edita las opciones del menú y pantallas a las que los usuarios tendrán acceso
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateMenu}
            className="px-4 py-2.5 bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-semibold text-xs rounded-xl shadow-xs border border-outline-variant/30 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">create_new_folder</span>
            <span>Nuevo Módulo</span>
          </button>
          <button
            onClick={() => handleOpenCreateOption()}
            className="px-4 py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Nueva Pantalla / Opción</span>
          </button>
        </div>
      </div>

      {/* Alert / Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {feedback.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/20 gap-2">
        <button
          onClick={() => setActiveTab("tree")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "tree"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">account_tree</span>
          <span>Estructura Jerárquica ({menus.length} Módulos)</span>
        </button>

        <button
          onClick={() => setActiveTab("options")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "options"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">layers</span>
          <span>Opciones de Pantalla ({options.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("menus")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "menus"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">folder_special</span>
          <span>Módulos Principales</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-on-surface-variant">Cargando opciones de menú...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: TREE VIEW */}
          {activeTab === "tree" && (
            <div className="space-y-4">
              {menus.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">folder_off</span>
                  <p className="text-sm font-semibold text-on-surface mt-2">No hay menús registrados</p>
                  <p className="text-xs text-on-surface-variant mt-1">Crea tu primer módulo o corre el script de datos iniciales.</p>
                </div>
              ) : (
                menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden"
                  >
                    {/* Header del Módulo */}
                    <div className="p-4 bg-surface-container-low/60 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-xl">{menu.icono || "folder"}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-on-surface">{menu.nombre}</h3>
                            <Badge variant={menu.activo ? "success" : "neutral"} size="sm">
                              {menu.activo ? "Activo" : "Inactivo"}
                            </Badge>
                            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                              {menu.codigo}
                            </span>
                          </div>
                          {menu.descripcion && (
                            <p className="text-xs text-on-surface-variant mt-0.5">{menu.descripcion}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenCreateOption(menu.id)}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                          title="Agregar opción a este menú"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          <span>Agregar Pantalla</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditMenu(menu)}
                          className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
                          title="Editar Módulo"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menu)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar Módulo"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Lista de Opciones Hijas */}
                    <div className="p-4">
                      {menu.options && menu.options.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {menu.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface hover:bg-surface-container-low/40 transition-all flex flex-col justify-between group"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                                      <span className="material-symbols-outlined text-lg">{opt.icono || "web"}</span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                                        {opt.nombre}
                                      </h4>
                                      <span className="text-[10px] font-mono text-on-surface-variant">{opt.codigo}</span>
                                    </div>
                                  </div>
                                  <Badge variant={opt.activo ? "success" : "neutral"} size="sm">
                                    {opt.activo ? "Activo" : "Inactivo"}
                                  </Badge>
                                </div>

                                {opt.descripcion && (
                                  <p className="text-[11px] text-on-surface-variant mt-2 line-clamp-2">
                                    {opt.descripcion}
                                  </p>
                                )}
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                                <span className="font-mono text-primary font-medium truncate max-w-[150px]">
                                  {opt.ruta || "—"}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditOption(opt)}
                                    className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded transition-colors"
                                    title="Editar opción"
                                  >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOption(opt)}
                                    className="p-1 text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                    title="Eliminar opción"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-outline-variant/40 rounded-xl">
                          <p className="text-xs text-on-surface-variant">No hay pantallas asociadas a este módulo.</p>
                          <button
                            onClick={() => handleOpenCreateOption(menu.id)}
                            className="mt-2 text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Registrar primera pantalla
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: OPTIONS TABLE */}
          {activeTab === "options" && (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por código, nombre o ruta..."
                    className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-on-surface-variant font-semibold">Módulo:</span>
                  <select
                    value={selectedMenuFilter}
                    onChange={(e) => setSelectedMenuFilter(e.target.value)}
                    className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">Todos los Módulos</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id.toString()}>
                        {m.nombre} ({m.codigo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3">Icono</th>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Nombre de Pantalla</th>
                      <th className="px-4 py-3">Módulo Padre</th>
                      <th className="px-4 py-3">Ruta Front</th>
                      <th className="px-4 py-3 text-center">Orden</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredOptions.map((opt) => (
                      <tr key={opt.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-7 h-7 rounded bg-surface-container-high text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-base">{opt.icono || "web"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-primary">{opt.codigo}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-on-surface">{opt.nombre}</p>
                          {opt.descripcion && (
                            <p className="text-[11px] text-on-surface-variant line-clamp-1">{opt.descripcion}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-on-surface">
                            {menus.find((m) => m.id === opt.menuId)?.nombre || `ID #${opt.menuId}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-on-surface-variant">{opt.ruta || "—"}</td>
                        <td className="px-4 py-3 text-center font-mono">{opt.orden}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={opt.activo ? "success" : "neutral"} size="sm">
                            {opt.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditOption(opt)}
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                              title="Editar opción"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOption(opt)}
                              className="p-1.5 text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar opción"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOptions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-on-surface-variant">
                          No se encontraron opciones de menú coincidentes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MENUS MANAGEMENT */}
          {activeTab === "menus" && (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-on-surface">Módulos Registrados</h3>
                <button
                  onClick={handleOpenCreateMenu}
                  className="px-3.5 py-1.5 bg-primary text-on-primary font-semibold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Nuevo Módulo</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3">Icono</th>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Descripción</th>
                      <th className="px-4 py-3 text-center">Orden</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {menus.map((m) => (
                      <tr key={m.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-7 h-7 rounded bg-primary-container text-on-primary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-base">{m.icono || "folder"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-primary">{m.codigo}</td>
                        <td className="px-4 py-3 font-bold text-on-surface">{m.nombre}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{m.descripcion || "—"}</td>
                        <td className="px-4 py-3 text-center font-mono">{m.orden}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={m.activo ? "success" : "neutral"} size="sm">
                            {m.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditMenu(m)}
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(m)}
                              className="p-1.5 text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: OPCIÓN DE MENÚ (PANTALLA) */}
      <Modal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        title={editingOption ? "Editar Pantalla / Opción de Menú" : "Registrar Nueva Pantalla / Opción"}
        subtitle="Configura la pantalla y la ruta a la que los usuarios podrán acceder"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveOption} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Módulo Padre *
              </label>
              <select
                required
                value={optionForm.menuId}
                onChange={(e) => setOptionForm({ ...optionForm, menuId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value={0} disabled>Seleccione un módulo</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Código Único *
              </label>
              <input
                type="text"
                required
                value={optionForm.codigo}
                onChange={(e) => setOptionForm({ ...optionForm, codigo: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                placeholder="EJ: INC_CONSULTA"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Nombre de la Pantalla / Opción *
            </label>
            <input
              type="text"
              required
              value={optionForm.nombre}
              onChange={(e) => setOptionForm({ ...optionForm, nombre: e.target.value })}
              placeholder="EJ: Consulta de Incidencias"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Ruta Frontend (URL)
              </label>
              <input
                type="text"
                value={optionForm.ruta}
                onChange={(e) => setOptionForm({ ...optionForm, ruta: e.target.value })}
                placeholder="EJ: /incidencias"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Icono (Material Symbol)
              </label>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-xl">{optionForm.icono || "web"}</span>
                </div>
                <input
                  type="text"
                  value={optionForm.icono}
                  onChange={(e) => setOptionForm({ ...optionForm, icono: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  placeholder="EJ: list_alt, bug_report, group"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={optionForm.descripcion}
              onChange={(e) => setOptionForm({ ...optionForm, descripcion: e.target.value })}
              placeholder="Breve detalle de la funcionalidad o propósito de esta pantalla"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Orden de Despliegue
              </label>
              <input
                type="number"
                value={optionForm.orden}
                onChange={(e) => setOptionForm({ ...optionForm, orden: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="opt_activo"
                checked={optionForm.activo}
                onChange={(e) => setOptionForm({ ...optionForm, activo: e.target.checked })}
                className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
              />
              <label htmlFor="opt_activo" className="text-xs font-semibold text-on-surface cursor-pointer">
                Opción Activa (Visible en el sistema)
              </label>
            </div>
          </div>

          <div className="pt-5 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOptionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
            >
              {editingOption ? "Guardar Cambios" : "Crear Pantalla"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: MENÚ PADRE (MÓDULO) */}
      <Modal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        title={editingMenu ? "Editar Módulo Principal" : "Nuevo Módulo Principal"}
        subtitle="Define la categoría o grupo contenedor de pantallas"
        maxWidth="md"
      >
        <form onSubmit={handleSaveMenu} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Código *
            </label>
            <input
              type="text"
              required
              value={menuForm.codigo}
              onChange={(e) => setMenuForm({ ...menuForm, codigo: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
              placeholder="EJ: MOD_REPORTES"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Nombre del Módulo *
            </label>
            <input
              type="text"
              required
              value={menuForm.nombre}
              onChange={(e) => setMenuForm({ ...menuForm, nombre: e.target.value })}
              placeholder="EJ: Reportes y Estadísticas"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Icono (Material Symbol)
              </label>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-xl">{menuForm.icono || "folder"}</span>
                </div>
                <input
                  type="text"
                  value={menuForm.icono}
                  onChange={(e) => setMenuForm({ ...menuForm, icono: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  placeholder="folder, settings..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Orden
              </label>
              <input
                type="number"
                value={menuForm.orden}
                onChange={(e) => setMenuForm({ ...menuForm, orden: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={menuForm.descripcion}
              onChange={(e) => setMenuForm({ ...menuForm, descripcion: e.target.value })}
              placeholder="Descripción breve del módulo"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="menu_activo"
              checked={menuForm.activo}
              onChange={(e) => setMenuForm({ ...menuForm, activo: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
            />
            <label htmlFor="menu_activo" className="text-xs font-semibold text-on-surface cursor-pointer">
              Módulo Activo
            </label>
          </div>

          <div className="pt-5 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsMenuModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
            >
              {editingMenu ? "Guardar Cambios" : "Crear Módulo"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
