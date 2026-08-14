import React, { useState, useEffect } from "react";
import { userService, roleService } from "../services/api";
import { User, Role, EstadoUsuario } from "../types";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal Nuevo Usuario
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    nombres: "",
    apellidos: "",
    telefono: "",
  });
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Modal Editar Usuario
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    nombres: string;
    apellidos: string;
    username: string;
    email: string;
    telefono: string;
    estado: EstadoUsuario;
  } | null>(null);
  const [editUserError, setEditUserError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Modal Asignar Rol
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(1);
  const [userRolesList, setUserRolesList] = useState<Role[]>([]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll({ search: search || undefined });
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    roleService.getAll().then((res) => {
      if (res.success) setRoles(res.data);
    });
  }, [search]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    setCreateUserError(null);
    try {
      const res = await userService.create(newUser);
      if (res.success) {
        setIsUserModalOpen(false);
        setNewUser({ username: "", email: "", password: "", nombres: "", apellidos: "", telefono: "" });
        fetchUsers();
      } else {
        setCreateUserError(res.message || "Error al crear usuario");
      }
    } catch (err: any) {
      console.error(err);
      setCreateUserError(err.response?.data?.message || err.message || "Error al crear usuario");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const openEditUserModal = (user: User) => {
    setEditingUser({
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      username: user.username,
      email: user.email,
      telefono: user.telefono || "",
      estado: user.estado,
    });
    setEditUserError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmittingEdit(true);
    setEditUserError(null);
    try {
      const res = await userService.update(editingUser.id, {
        nombres: editingUser.nombres,
        apellidos: editingUser.apellidos,
        username: editingUser.username,
        email: editingUser.email,
        telefono: editingUser.telefono || undefined,
        estado: editingUser.estado,
      });
      if (res.success) {
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        setEditUserError(res.message || "Error al actualizar usuario");
      }
    } catch (err: any) {
      console.error(err);
      setEditUserError(err.response?.data?.message || err.message || "Error al actualizar usuario");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const openAssignRoleModal = async (userId: string) => {
    setSelectedUserId(userId);
    setIsRoleModalOpen(true);
    try {
      const res = await roleService.getUserRoles(userId);
      if (res.success) setUserRolesList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await roleService.assignRole(selectedUserId, selectedRoleId);
      const res = await roleService.getUserRoles(selectedUserId);
      if (res.success) setUserRolesList(res.data);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    if (!selectedUserId) return;
    try {
      await roleService.removeRole(selectedUserId, roleId);
      const res = await roleService.getUserRoles(selectedUserId);
      if (res.success) setUserRolesList(res.data);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Deseas inactivar a este usuario?")) return;
    try {
      await userService.delete(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Gestión de Usuarios</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Administra cuentas de usuario, estado de accesos y asignación de roles
          </p>
        </div>
        <button
          onClick={() => {
            setCreateUserError(null);
            setIsUserModalOpen(true);
          }}
          className="px-4 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          <span>Registrar Usuario</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario por nombre, username o email..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-on-surface-variant">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                <tr>
                  <th className="px-5 py-3.5">Usuario</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Teléfono</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Último Login</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xs">
                          {u.nombres.charAt(0)}{u.apellidos.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{u.nombres} {u.apellidos}</p>
                          <p className="text-[11px] text-on-surface-variant">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-on-surface-variant">{u.email}</td>
                    <td className="px-5 py-4">{u.telefono || "N/A"}</td>
                    <td className="px-5 py-4">
                      <Badge variant={u.estado === "activo" ? "success" : u.estado === "bloqueado" ? "danger" : "warning"}>
                        {u.estado.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">
                      {u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleDateString() : "Nunca"}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => openAssignRoleModal(u.id)}
                        className="px-2.5 py-1.5 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Asignar o remover roles"
                      >
                        Roles
                      </button>
                      <button
                        onClick={() => openEditUserModal(u)}
                        className="p-1.5 text-primary hover:bg-primary-container/20 rounded-lg transition-colors cursor-pointer"
                        title="Editar usuario"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                        title="Inactivar usuario"
                      >
                        <span className="material-symbols-outlined text-base">block</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Registrar Nuevo Usuario"
        subtitle="Crea una cuenta de acceso al sistema"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {createUserError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs">
              {createUserError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Nombres *</label>
              <input
                type="text"
                required
                value={newUser.nombres}
                onChange={(e) => setNewUser({ ...newUser, nombres: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Apellidos *</label>
              <input
                type="text"
                required
                value={newUser.apellidos}
                onChange={(e) => setNewUser({ ...newUser, apellidos: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Username *</label>
              <input
                type="text"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Contraseña Inicial *</label>
              <input
                type="password"
                required
                minLength={8}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Teléfono</label>
              <input
                type="text"
                value={newUser.telefono}
                onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                placeholder="+51 999 999 999"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingCreate}
              className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmittingCreate ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        title="Editar Usuario"
        subtitle="Modifica los datos personales y el estado de la cuenta"
        maxWidth="lg"
      >
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            {editUserError && (
              <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs">
                {editUserError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Nombres *</label>
                <input
                  type="text"
                  required
                  value={editingUser.nombres}
                  onChange={(e) => setEditingUser({ ...editingUser, nombres: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={editingUser.apellidos}
                  onChange={(e) => setEditingUser({ ...editingUser, apellidos: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Teléfono</label>
                <input
                  type="text"
                  value={editingUser.telefono}
                  onChange={(e) => setEditingUser({ ...editingUser, telefono: e.target.value })}
                  placeholder="+51 999 999 999"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">Estado *</label>
                <select
                  value={editingUser.estado}
                  onChange={(e) => setEditingUser({ ...editingUser, estado: e.target.value as EstadoUsuario })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmittingEdit ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Asignar Roles */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Asignación de Roles por Usuario"
        subtitle="Agrega o remueve roles de seguridad"
        maxWidth="md"
      >
        <div className="space-y-6">
          <form onSubmit={handleAssignRole} className="flex gap-2">
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre} ({r.codigo})</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl cursor-pointer"
            >
              Asignar
            </button>
          </form>

          <div>
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase mb-3">Roles Asignados Actuales:</h4>
            {userRolesList.length === 0 ? (
              <p className="text-xs text-on-surface-variant/60 italic">No tiene roles asignados</p>
            ) : (
              <div className="space-y-2">
                {userRolesList.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <div>
                      <p className="font-bold text-xs text-on-surface">{r.nombre}</p>
                      <p className="text-[11px] font-mono text-on-surface-variant">{r.codigo}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveRole(r.id)}
                      className="p-1 text-error hover:bg-error-container/20 rounded-lg cursor-pointer"
                      title="Quitar rol"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

