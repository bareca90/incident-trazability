import React, { useState, useEffect } from "react";
import { auditLogService } from "../services/api";
import { AuditLog } from "../types";
import { Badge } from "../components/common/Badge";

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accionFilter, setAccionFilter] = useState("");
  const [entidadFilter, setEntidadFilter] = useState("");

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await auditLogService.getAll({
        accion: accionFilter || undefined,
        entidad: entidadFilter || undefined,
        limit: 25,
      });
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [accionFilter, entidadFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Logs de AuditorÃ­a y Trazabilidad</h2>
        <p className="text-xs text-on-surface-variant mt-1">
          BitÃ¡cora inmutable de todas las acciones, mutaciones e intentos de acceso
        </p>
      </div>

      {/* Filter */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={accionFilter}
          onChange={(e) => setAccionFilter(e.target.value)}
          placeholder="Filtrar por AcciÃ³n (ej: LOGIN, CREATE_INCIDENT)..."
          className="px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary flex-1"
        />
        <input
          type="text"
          value={entidadFilter}
          onChange={(e) => setEntidadFilter(e.target.value)}
          placeholder="Filtrar por Entidad (ej: users, incidents)..."
          className="px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary flex-1"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-on-surface-variant">Cargando logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                <tr>
                  <th className="px-5 py-3.5">Fecha / Hora</th>
                  <th className="px-5 py-3.5">Usuario</th>
                  <th className="px-5 py-3.5">AcciÃ³n</th>
                  <th className="px-5 py-3.5">Entidad & ID</th>
                  <th className="px-5 py-3.5">IP</th>
                  <th className="px-5 py-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-on-surface-variant text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-on-surface">
                      {log.user ? `@${log.user.username}` : "AnÃ³nimo"}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">{log.accion}</td>
                    <td className="px-5 py-3.5 text-on-surface-variant">
                      {log.entidad || "N/A"} {log.entidadId ? `(#${log.entidadId})` : ""}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">{log.ipAddress || "::1"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={log.exitoso ? "success" : "danger"}>
                        {log.exitoso ? "Ã‰XITO" : "FALLO"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
