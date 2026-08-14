import React, { useState, useEffect } from "react";
import { roleService, menuService } from "../services/api";
import { Role, MenuOption } from "../types";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [options, setOptions] = useState<MenuOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Modal Nuevo Rol
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ codigo: "", nombre: "", descripcion: "", esAdmin: false });

  const fetchRolesAndOptions = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, optionsRes] = await Promise.all([
        roleService.getAll(),
        menuService.getAllOptions(),
      ]);
      if (rolesRes.success) setRoles(rolesRes.data);
      if (optionsRes.success) setOptions(optionsRes.data);
      if (rolesRes.data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rolesRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndOptions();
  }, []);

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const res = await roleService.getPermissions(roleId);
      if (res.success) {
        const map: Record<string, boolean> = {};
        res.data.forEach((p: any) => {
          map[`${p.menuOptionId}_${p.acceso}`] = p.permitido;
        });
        setPermissionsState(map);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedRoleId) fetchRolePermissions(selectedRoleId);
  }, [selectedRoleId]);

  const handleTogglePermission = (menuOptionId: number, acceso: string) => {
    const key = `${menuOptionId}_${acceso}`;
    setPermissionsState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    const permissionsPayload = Object.entries(permissionsState).map(([key, permitido]) => {
      const [menuOptionIdStr, acceso] = key.split("_");
      return {
        menuOptionId: parseInt(menuOptionIdStr),
        acceso,
        permitido,
      };
    });

    try {
      await roleService.setPermissions(selectedRoleId, permissionsPayload);
      alert("Permisos guardados correctamente");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await roleService.create(newRole);
      if (res.success) {
        setIsRoleModalOpen(false);
        setNewRole({ codigo: "", nombre: "", descripcion: "", esAdmin: false });
        fetchRolesAndOptions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const accesosDisponibles = ["ver", "crear", "editar", "eliminar", "exportar", "aprobar"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Matriz de Roles y Permisos</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Configura accesos granulares sobre las pantallas del sistema
          </p>
        </div>
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="px-4 py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-xl shadow-sm hover:bg-primary-container transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add_security</span>
          <span>Nuevo Rol</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles Sidebar Selection */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase px-2 mb-2">Seleccionar Rol</h3>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoleId(r.id)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                selectedRoleId === r.id
                  ? "bg-primary text-on-primary border-primary shadow-sm"
                  : "bg-surface-container-low border-outline-variant/20 hover:bg-surface-container-high text-on-surface"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">{r.nombre}</span>
                {r.esAdmin && <Badge variant="warning">Admin</Badge>}
              </div>
              <p className="text-[11px] opacity-80 mt-1 font-mono">{r.codigo}</p>
            </button>
          ))}
        </div>

        {/* Matrix Table */}
        <div className="lg:col-span-3 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div>
              <h3 className="text-lg font-bold text-on-surface">
                Permisos para: {roles.find((r) => r.id === selectedRoleId)?.nombre}
              </h3>
              <p className="text-xs text-on-surface-variant">Marca las casillas para otorgar accesos</p>
            </div>
            <button
              onClick={handleSavePermissions}
              className="px-5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl shadow-sm hover:bg-primary-container transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Guardar Permisos</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3">Opción de Menú</th>
                  {accesosDisponibles.map((a) => (
                    <th key={a} className="px-3 py-3 text-center uppercase">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {options.map((opt) => (
                  <tr key={opt.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-on-surface">
                      {opt.nombre}
                      <span className="block text-[10px] text-on-surface-variant font-mono font-normal">
                        {opt.codigo} ({opt.ruta})
                      </span>
                    </td>
                    {accesosDisponibles.map((acceso) => {
                      const isChecked = !!permissionsState[`${opt.id}_${acceso}`];
                      return (
                        <td key={acceso} className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(opt.id, acceso)}
                            className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nuevo Rol */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Crear Nuevo Rol de Seguridad"
        subtitle="Define las propiedades iniciales del rol"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Código *</label>
            <input
              type="text"
              required
              value={newRole.codigo}
              onChange={(e) => setNewRole({ ...newRole, codigo: e.target.value.toUpperCase() })}
              placeholder="EJ: AUDITOR_TI"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={newRole.nombre}
              onChange={(e) => setNewRole({ ...newRole, nombre: e.target.value })}
              placeholder="Auditor de TI"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Descripción</label>
            <textarea
              rows={2}
              value={newRole.descripcion}
              onChange={(e) => setNewRole({ ...newRole, descripcion: e.target.value })}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs"
            />
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl"
            >
              Crear Rol
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
