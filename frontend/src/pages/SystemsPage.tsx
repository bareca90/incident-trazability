import React, { useState, useEffect, useMemo } from "react";
import { systemService } from "../services/api";
import { System } from "../types";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";

export const SystemsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [systems, setSystems] = useState<System[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    activo: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback toast
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchSystems = async () => {
    setIsLoading(true);
    try {
      const res = await systemService.getAll();
      if (res.success) {
        setSystems(res.data);
      }
    } catch (err: any) {
      console.error(err);
      showFeedback("error", err.response?.data?.message || "Error al cargar la lista de sistemas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleOpenCreate = () => {
    setEditingSystem(null);
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      activo: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sys: System) => {
    setEditingSystem(sys);
    setFormData({
      codigo: sys.codigo,
      nombre: sys.nombre,
      descripcion: sys.descripcion || "",
      activo: sys.activo,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingSystem) {
        await systemService.update(editingSystem.id, formData);
        showFeedback("success", `Sistema "${formData.nombre}" actualizado.`);
      } else {
        await systemService.create(formData);
        showFeedback("success", `Sistema "${formData.nombre}" registrado exitosamente.`);
      }
      setIsModalOpen(false);
      fetchSystems();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || err.message || "Error al guardar el sistema");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sys: System) => {
    if (!window.confirm(`¿Estás seguro de eliminar el sistema "${sys.nombre}" (${sys.codigo})?`)) return;
    try {
      await systemService.delete(sys.id);
      showFeedback("success", `Sistema "${sys.nombre}" eliminado.`);
      fetchSystems();
    } catch (err: any) {
      console.error(err);
      showFeedback("error", err.response?.data?.message || "Error al eliminar el sistema");
    }
  };

  const filteredSystems = useMemo(() => {
    return systems.filter((sys) => {
      const q = search.toLowerCase();
      return (
        sys.nombre.toLowerCase().includes(q) ||
        sys.codigo.toLowerCase().includes(q) ||
        (sys.descripcion && sys.descripcion.toLowerCase().includes(q))
      );
    });
  }, [systems, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">dns</span>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Catálogo de Sistemas Afectados</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Administra los sistemas corporativos e informáticos que pueden asociarse a las incidencias técnicas
          </p>
        </div>

        {hasPermission("CONF_SISTEMAS", "crear") && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Nuevo Sistema</span>
          </button>
        )}
      </div>

      {/* Alert Feedback */}
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

      {/* Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, nombre o descripción..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Systems Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-on-surface-variant">Cargando sistemas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                <tr>
                  <th className="px-5 py-3.5">Código</th>
                  <th className="px-5 py-3.5">Nombre del Sistema</th>
                  <th className="px-5 py-3.5">Descripción</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredSystems.map((sys) => (
                  <tr key={sys.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-primary">{sys.codigo}</td>
                    <td className="px-5 py-4 font-semibold text-on-surface flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary/70"></span>
                      <span>{sys.nombre}</span>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant max-w-xs truncate">
                      {sys.descripcion || "—"}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={sys.activo ? "success" : "neutral"} size="sm">
                        {sys.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5">
                      {hasPermission("CONF_SISTEMAS", "editar") && (
                        <button
                          onClick={() => handleOpenEdit(sys)}
                          className="p-1.5 text-primary hover:bg-primary-container/20 rounded-lg transition-colors cursor-pointer"
                          title="Editar sistema"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                      )}
                      {hasPermission("CONF_SISTEMAS", "eliminar") && (
                        <button
                          onClick={() => handleDelete(sys)}
                          className="p-1.5 text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar sistema"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSystems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-on-surface-variant">
                      No se encontraron sistemas registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSystem ? "Editar Sistema" : "Registrar Nuevo Sistema"}
        subtitle="Define el nombre y código del sistema o software empresarial"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Código Único *
            </label>
            <input
              type="text"
              required
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
              placeholder="EJ: SYS_FACTURACION"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Nombre del Sistema *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="EJ: Sistema de Facturación Electrónica"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Detalle o módulos que conforman este sistema..."
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="sys_activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
            />
            <label htmlFor="sys_activo" className="text-xs font-semibold text-on-surface cursor-pointer">
              Sistema Activo (Disponible para vincular a incidencias)
            </label>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : editingSystem ? "Guardar Cambios" : "Crear Sistema"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
