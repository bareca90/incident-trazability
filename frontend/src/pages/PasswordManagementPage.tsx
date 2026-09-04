import React, { useState, useEffect } from "react";
import { userService } from "../services/api";
import { User, AuditLog } from "../types";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";

export const PasswordManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");

  // Estado para la tabla de usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMustChange, setFilterMustChange] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");

  // Estado para la bitácora de auditoría
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Modal de Reseteo de Clave
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState("");
  const [requireChangeOnLogin, setRequireChangeOnLogin] = useState(true);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Carga de usuarios
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await userService.getAll({
        search: search || undefined,
        estado: filterEstado !== "all" ? filterEstado : undefined,
      });
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Carga de bitácora
  const fetchAudit = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await userService.getPasswordLogs({ limit: 50 });
      if (res.success) {
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchAudit();
    }
  }, [activeTab, search, filterEstado]);

  // Generador de clave aleatoria de alta seguridad
  const generateRandomPassword = () => {
    const charsUpper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const charsLower = "abcdefghijkmnopqrstuvwxyz";
    const charsNum = "23456789";
    const charsSpec = "!@#$%*?";
    const all = charsUpper + charsLower + charsNum + charsSpec;

    let pwd = "";
    pwd += charsUpper[Math.floor(Math.random() * charsUpper.length)];
    pwd += charsLower[Math.floor(Math.random() * charsLower.length)];
    pwd += charsNum[Math.floor(Math.random() * charsNum.length)];
    pwd += charsSpec[Math.floor(Math.random() * charsSpec.length)];

    for (let i = 4; i < 12; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    // Mezclar caracteres
    const shuffled = pwd.split("").sort(() => 0.5 - Math.random()).join("");
    setTempPassword(shuffled);
    setShowTempPassword(true);
  };

  const copyToClipboard = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const openResetModal = (user: User) => {
    setSelectedUser(user);
    setTempPassword("");
    setRequireChangeOnLogin(true);
    setResetError(null);
    setResetSuccess(null);
    setShowTempPassword(false);
    setIsResetModalOpen(true);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setResetError(null);
    setResetSuccess(null);
    setIsSubmittingReset(true);

    try {
      const res = await userService.resetPassword(selectedUser.id, tempPassword, requireChangeOnLogin);
      if (res.success) {
        setResetSuccess(`Contraseña reseteada para @${selectedUser.username}.`);
        fetchUsers();
        setTimeout(() => {
          setIsResetModalOpen(false);
        }, 1500);
      } else {
        setResetError(res.message || "Error al resetear contraseña.");
      }
    } catch (err: any) {
      setResetError(err.response?.data?.message || err.message || "Error al resetear contraseña.");
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleToggleForceChange = async (user: User) => {
    const newValue = !user.mustChangePwd;
    const confirmText = newValue
      ? `¿Deseas exigir cambio obligatorio de contraseña para @${user.username} en su próximo inicio de sesión?`
      : `¿Deseas desmarcar el cambio obligatorio para @${user.username}?`;

    if (!confirm(confirmText)) return;

    try {
      await userService.forcePasswordChange(user.id, newValue);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la política del usuario.");
    }
  };

  const handleUnlockUser = async (user: User) => {
    if (!confirm(`¿Deseas desbloquear la cuenta de @${user.username} y restablecer sus intentos fallidos a 0?`)) return;

    try {
      await userService.unlock(user.id);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error al desbloquear el usuario.");
    }
  };

  // Filtrado de usuarios por mustChangePwd
  const filteredUsers = users.filter((u) => {
    if (filterMustChange === "pending") return u.mustChangePwd === true;
    if (filterMustChange === "ok") return u.mustChangePwd === false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Gestión de Credenciales & Claves</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Administración de políticas de contraseñas, reseteo de claves, desbloqueo y bitácora de seguridad
          </p>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "users"
                ? "bg-surface text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base">manage_accounts</span>
            <span>Usuarios & Claves</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "bg-surface text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base">history</span>
            <span>Bitácora de Claves</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: TABLA DE GESTIÓN DE CLAVES */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por usuario, nombre o correo..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterMustChange}
                onChange={(e) => setFilterMustChange(e.target.value)}
                className="px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Estado Clave: Todos</option>
                <option value="pending">Cambio Pendiente</option>
                <option value="ok">Contraseña al Día</option>
              </select>

              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Cuenta: Todas</option>
                <option value="activo">Activos</option>
                <option value="bloqueado">Bloqueados</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
            {isLoadingUsers ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-on-surface-variant">Cargando credenciales de usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant text-xs">
                No se encontraron usuarios con los filtros seleccionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                    <tr>
                      <th className="px-5 py-3.5">Usuario</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Estado Cuenta</th>
                      <th className="px-5 py-3.5">Estado Clave</th>
                      <th className="px-5 py-3.5">Intentos Fallidos</th>
                      <th className="px-5 py-3.5">Último Login</th>
                      <th className="px-5 py-3.5 text-right">Acciones de Seguridad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredUsers.map((u) => {
                      const isLocked = u.estado === "bloqueado" || u.intentosLogin >= 5;
                      const hasWarning = u.intentosLogin >= 3 && !isLocked;

                      return (
                        <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xs flex-shrink-0">
                                {u.nombres?.charAt(0) ?? "U"}{u.apellidos?.charAt(0) ?? "A"}
                              </div>
                              <div>
                                <p className="font-bold text-on-surface">{u.nombres} {u.apellidos}</p>
                                <p className="text-[11px] text-on-surface-variant">@{u.username}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 font-mono text-on-surface-variant">{u.email}</td>

                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                u.estado === "activo"
                                  ? "success"
                                  : u.estado === "bloqueado"
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {u.estado.toUpperCase()}
                            </Badge>
                          </td>

                          <td className="px-5 py-4">
                            {u.mustChangePwd ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                <span className="material-symbols-outlined text-xs">pending_actions</span>
                                <span>Cambio Obligatorio</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                <span>Al Día</span>
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  isLocked
                                    ? "text-error"
                                    : hasWarning
                                    ? "text-amber-600"
                                    : "text-on-surface-variant"
                                }`}
                              >
                                {u.intentosLogin} / 5
                              </span>
                              {isLocked && (
                                <span className="px-1.5 py-0.5 rounded bg-error/15 text-error text-[10px] font-bold">
                                  Bloqueado
                                </span>
                              )}
                              {hasWarning && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold">
                                  Alerta
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-on-surface-variant">
                            {u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleDateString() : "Nunca"}
                          </td>

                          <td className="px-5 py-4 text-right space-x-1">
                            {/* Botón Resetear Clave */}
                            <button
                              onClick={() => openResetModal(u)}
                              className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-lg transition-colors font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                              title="Resetear contraseña"
                            >
                              <span className="material-symbols-outlined text-sm">password</span>
                              <span>Resetear</span>
                            </button>

                            {/* Botón Forzar Cambio de Clave */}
                            <button
                              onClick={() => handleToggleForceChange(u)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                u.mustChangePwd
                                  ? "text-amber-600 hover:bg-amber-500/20 bg-amber-500/10"
                                  : "text-on-surface-variant hover:bg-surface-container-high"
                              }`}
                              title={
                                u.mustChangePwd
                                  ? "Desmarcar cambio obligatorio"
                                  : "Forzar cambio de clave en próximo login"
                              }
                            >
                              <span className="material-symbols-outlined text-base">
                                {u.mustChangePwd ? "lock_clock" : "lock_open"}
                              </span>
                            </button>

                            {/* Botón Desbloquear (si tiene intentos o estado bloqueado) */}
                            {(u.intentosLogin > 0 || u.estado === "bloqueado") && (
                              <button
                                onClick={() => handleUnlockUser(u)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-500/20 bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Desbloquear cuenta e inicializar intentos"
                              >
                                <span className="material-symbols-outlined text-base">lock_reset</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: TABLA DE BITÁCORA / HISTORIAL DE CLAVES */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
            {isLoadingAudit ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-on-surface-variant">Cargando bitácora de contraseñas...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant text-xs">
                No hay registros recientes de eventos de contraseñas.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                    <tr>
                      <th className="px-5 py-3.5">Fecha y Hora</th>
                      <th className="px-5 py-3.5">Usuario / ID</th>
                      <th className="px-5 py-3.5">Acción</th>
                      <th className="px-5 py-3.5">Descripción</th>
                      <th className="px-5 py-3.5">IP</th>
                      <th className="px-5 py-3.5">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-on-surface-variant">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-on-surface">
                          {log.user ? `@${log.user.username}` : log.entidadId || "N/A"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-surface-container text-primary border border-outline-variant/30">
                            {log.accion}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-on-surface-variant max-w-xs truncate">
                          {log.descripcion || "-"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-on-surface-variant">
                          {log.ipAddress || "-"}
                        </td>
                        <td className="px-5 py-3.5">
                          {log.exitoso ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              Exitoso
                            </span>
                          ) : (
                            <span className="text-error font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">cancel</span>
                              Fallido
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: RESETEO DE CONTRASEÑA */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Resetear Contraseña de Usuario"
        subtitle={selectedUser ? `Asignar nueva contraseña para ${selectedUser.nombres} (@${selectedUser.username})` : ""}
        maxWidth="md"
      >
        <form onSubmit={handleResetSubmit} className="space-y-4">
          {resetError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs">
              {resetError}
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs">
              {resetSuccess}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase">
                Nueva Contraseña Temporal *
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">casino</span>
                <span>Generar Aleatoria</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showTempPassword ? "text" : "password"}
                required
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-3 pr-20 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {tempPassword && (
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="p-1 text-on-surface-variant hover:text-primary rounded transition-colors"
                    title="Copiar contraseña"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedNotification ? "done" : "content_copy"}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowTempPassword(!showTempPassword)}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    {showTempPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {copiedNotification && (
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
                ¡Contraseña copiada al portapapeles!
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="requireChange"
              checked={requireChangeOnLogin}
              onChange={(e) => setRequireChangeOnLogin(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="requireChange" className="text-xs text-on-surface cursor-pointer select-none">
              Exigir al usuario cambiar la contraseña en su próximo inicio de sesión (<span className="font-mono text-primary">must_change_pwd</span>)
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingReset || tempPassword.length < 8}
              className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingReset ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">vpn_key</span>
                  <span>Establecer Contraseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
