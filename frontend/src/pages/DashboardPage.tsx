import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { incidentService, auditLogService, userService } from "../services/api";
import { Incident, AuditLog } from "../types";
import { Badge } from "../components/common/Badge";

export const DashboardPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    abiertas: 0,
    enProceso: 0,
    resueltas: 0,
    usuariosActivos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [incRes, auditRes, userRes] = await Promise.all([
          incidentService.getAll({ limit: 5 }),
          auditLogService.getAll({ limit: 5 }),
          userService.getAll({ limit: 1 }),
        ]);

        if (incRes.success) {
          setIncidents(incRes.data);
          const total = incRes.pagination?.total || incRes.data.length;
          const abiertas = incRes.data.filter((i) => i.estado === "abierta").length;
          const enProceso = incRes.data.filter((i) => i.estado === "en_proceso").length;
          const resueltas = incRes.data.filter((i) => i.estado === "resuelta" || i.estado === "cerrada").length;

          setStats((prev) => ({ ...prev, total, abiertas, enProceso, resueltas }));
        }

        if (auditRes.success) setAuditLogs(auditRes.data);
        if (userRes.success) {
          setStats((prev) => ({ ...prev, usuariosActivos: userRes.pagination?.total || 1 }));
        }
      } catch (err) {
        console.error("Error al cargar dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "critica": return <Badge variant="danger">CrÃ­tica</Badge>;
      case "alta":    return <Badge variant="warning">Alta</Badge>;
      case "media":   return <Badge variant="info">Media</Badge>;
      default:        return <Badge variant="neutral">Baja</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "abierta":    return <Badge variant="danger">Abierta</Badge>;
      case "en_proceso": return <Badge variant="warning">En Proceso</Badge>;
      case "resuelta":   return <Badge variant="success">Resuelta</Badge>;
      case "cerrada":    return <Badge variant="neutral">Cerrada</Badge>;
      default:           return <Badge variant="info">{s}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-container to-surface-tint p-6 md:p-8 rounded-2xl text-on-primary shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider bg-on-primary/15 px-3 py-1 rounded-full inline-block mb-3">
            Centro de Operaciones
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard de Trazabilidad</h2>
          <p className="text-sm text-on-primary/80 mt-2">
            Monitoreo en tiempo real de incidentes de infraestructura, aplicaciones y soluciones paso a paso.
          </p>
        </div>
        <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[180px] text-on-primary/5 select-none pointer-events-none">
          analytics
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">confirmation_number</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase">Total Incidentes</p>
            <h3 className="text-2xl font-bold text-on-surface mt-0.5">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">error_med</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase">Abiertas</p>
            <h3 className="text-2xl font-bold text-on-surface mt-0.5">{stats.abiertas}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase">En Proceso</p>
            <h3 className="text-2xl font-bold text-on-surface mt-0.5">{stats.enProceso}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase">Resueltas</p>
            <h3 className="text-2xl font-bold text-on-surface mt-0.5">{stats.resueltas}</h3>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Incidents Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Incidencias Recientes</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Ãšltimos casos registrados en la plataforma</p>
              </div>
              <Link
                to="/incidencias"
                className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-1 transition-colors"
              >
                <span>Ver todas</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            {incidents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-outline-variant/30 rounded-xl">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">assignment_late</span>
                <p className="text-sm font-medium text-on-surface-variant">No hay incidencias registradas</p>
                <Link
                  to="/incidencias"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg shadow-sm hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Registrar Nueva Incidencia</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3">CÃ³digo</th>
                      <th className="px-4 py-3">TÃ­tulo</th>
                      <th className="px-4 py-3">Prioridad</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">AcciÃ³n</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {incidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-semibold text-primary">{inc.numero}</td>
                        <td className="px-4 py-3.5 font-medium text-on-surface truncate max-w-[200px]">{inc.titulo}</td>
                        <td className="px-4 py-3.5">{getPriorityBadge(inc.prioridad)}</td>
                        <td className="px-4 py-3.5">{getStatusBadge(inc.estado)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            to={`/incidencias/${inc.id}`}
                            className="p-1.5 text-primary hover:bg-primary-container/10 rounded-lg inline-flex items-center justify-center transition-colors"
                            title="Ver Detalle y Pasos"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Activity Feed */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">BitÃ¡cora de Actividad</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Ãšltimos eventos del sistema</p>
            </div>
            <Link to="/audit-logs" className="text-xs font-semibold text-primary hover:underline">
              Ver logs
            </Link>
          </div>

          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">Sin registros recientes</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs p-3 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                  <div className="w-7 h-7 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">history</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-on-surface truncate">{log.accion}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {log.user?.username ? `@${log.user.username}` : "Sistema"} â€¢ {log.entidad || "General"}
                    </p>
                    <span className="text-[10px] text-on-surface-variant/70 font-mono mt-1 block">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
