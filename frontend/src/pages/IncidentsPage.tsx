import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { incidentService, userService } from "../services/api";
import { Incident, User, EstadoIncidencia, Prioridad } from "../types";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [prioridadFilter, setPrioridadFilter] = useState("");

  // Modal Nueva Incidencia / Solución
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [newIncident, setNewIncident] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media" as Prioridad,
    estado: "abierta" as EstadoIncidencia,
    categoria: "Base de Datos",
    ambiente: "Producción",
    servidor: "",
    baseDatos: "",
    asignadoA: "",
    impacto: "",
    causaRaiz: "",
    solucionResumida: "",
    ticketProactivanet: "",
  });

  // Modal Editar Incidencia (Cabecera)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editingIncident, setEditingIncident] = useState<{
    id: string;
    numero: string;
    titulo: string;
    descripcion: string;
    prioridad: Prioridad;
    estado: EstadoIncidencia;
    categoria: string;
    ambiente: string;
    servidor: string;
    baseDatos: string;
    asignadoA: string;
    impacto: string;
    causaRaiz: string;
    solucionResumida: string;
    ticketProactivanet: string;
  } | null>(null);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const res = await incidentService.getAll({
        search: search || undefined,
        estado: estadoFilter || undefined,
        prioridad: prioridadFilter || undefined,
      });
      if (res.success) setIncidents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, estadoFilter, prioridadFilter]);

  useEffect(() => {
    userService.getAll().then((res) => {
      if (res.success) setUsers(res.data);
    });
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    setCreateError(null);
    try {
      const payload: Partial<Incident> = {
        titulo: newIncident.titulo,
        descripcion: newIncident.descripcion,
        prioridad: newIncident.prioridad,
        estado: newIncident.estado,
        categoria: newIncident.categoria || undefined,
        ambiente: newIncident.ambiente || undefined,
        servidor: newIncident.servidor || undefined,
        baseDatos: newIncident.baseDatos || undefined,
        asignadoA: newIncident.asignadoA || undefined,
        impacto: newIncident.impacto || undefined,
        causaRaiz: newIncident.causaRaiz || undefined,
        solucionResumida: newIncident.solucionResumida || undefined,
        ticketProactivanet: newIncident.ticketProactivanet || undefined,
      };
      const res = await incidentService.create(payload);
      if (res.success) {
        setIsCreateModalOpen(false);
        setNewIncident({
          titulo: "",
          descripcion: "",
          prioridad: "media",
          estado: "abierta",
          categoria: "Base de Datos",
          ambiente: "Producción",
          servidor: "",
          baseDatos: "",
          asignadoA: "",
          impacto: "",
          causaRaiz: "",
          solucionResumida: "",
          ticketProactivanet: "",
        });
        fetchIncidents();
      } else {
        setCreateError(res.message || "Error al crear la incidencia");
      }
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || err.message || "Error al crear la incidencia");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const openEditModal = (inc: Incident) => {
    setEditingIncident({
      id: inc.id,
      numero: inc.numero,
      titulo: inc.titulo,
      descripcion: inc.descripcion,
      prioridad: inc.prioridad,
      estado: inc.estado,
      categoria: inc.categoria || "",
      ambiente: inc.ambiente || "",
      servidor: inc.servidor || "",
      baseDatos: inc.baseDatos || "",
      asignadoA: inc.asignadoA || "",
      impacto: inc.impacto || "",
      causaRaiz: inc.causaRaiz || "",
      solucionResumida: inc.solucionResumida || "",
      ticketProactivanet: inc.ticketProactivanet || "",
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident) return;
    setIsSubmittingEdit(true);
    setEditError(null);
    try {
      const payload: Partial<Incident> = {
        titulo: editingIncident.titulo,
        descripcion: editingIncident.descripcion,
        prioridad: editingIncident.prioridad,
        estado: editingIncident.estado,
        categoria: editingIncident.categoria || undefined,
        ambiente: editingIncident.ambiente || undefined,
        servidor: editingIncident.servidor || undefined,
        baseDatos: editingIncident.baseDatos || undefined,
        asignadoA: editingIncident.asignadoA || undefined,
        impacto: editingIncident.impacto || undefined,
        causaRaiz: editingIncident.causaRaiz || undefined,
        solucionResumida: editingIncident.solucionResumida || undefined,
        ticketProactivanet: editingIncident.ticketProactivanet || undefined,
        fechaResolucion:
          editingIncident.estado === "resuelta" || editingIncident.estado === "cerrada"
            ? new Date().toISOString()
            : undefined,
      };
      const res = await incidentService.update(editingIncident.id, payload);
      if (res.success) {
        setIsEditModalOpen(false);
        setEditingIncident(null);
        fetchIncidents();
      } else {
        setEditError(res.message || "Error al actualizar la incidencia");
      }
    } catch (err: any) {
      console.error(err);
      setEditError(err.response?.data?.message || err.message || "Error al actualizar la incidencia");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteIncident = async (id: string, numero: string) => {
    if (!confirm(`¿Estás seguro de eliminar o inactivar la incidencia ${numero}?`)) return;
    try {
      await incidentService.delete(id);
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "critica": return <Badge variant="danger">Crítica</Badge>;
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
      case "cancelada":  return <Badge variant="neutral">Cancelada</Badge>;
      case "reabierta":  return <Badge variant="danger">Reabierta</Badge>;
      default:           return <Badge variant="info">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Gestión de Incidentes y Soluciones</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Registro con correlativo interno y ticket Proactivanet, seguimiento de pasos y trazabilidad
          </p>
        </div>
        <button
          onClick={() => {
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Nueva Incidencia / Solución</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ticket, Proactivanet, título o descripción..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los Estados</option>
            <option value="abierta">Abierta</option>
            <option value="en_proceso">En Proceso</option>
            <option value="resuelta">Resuelta</option>
            <option value="cerrada">Cerrada</option>
            <option value="cancelada">Cancelada</option>
            <option value="reabierta">Reabierta</option>
          </select>

          <select
            value={prioridadFilter}
            onChange={(e) => setPrioridadFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las Prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-on-surface-variant">Cargando incidencias...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">inbox</span>
            <p className="text-sm font-semibold text-on-surface">No se encontraron incidencias</p>
            <p className="text-xs text-on-surface-variant mt-1">Crea una nueva incidencia o ajusta los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase border-b border-outline-variant/20">
                <tr>
                  <th className="px-5 py-3.5">Ticket / Proactivanet</th>
                  <th className="px-5 py-3.5">Título & Categoría</th>
                  <th className="px-5 py-3.5">Ambiente / BD</th>
                  <th className="px-5 py-3.5">Prioridad</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Asignado a</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <Link to={`/incidencias/${inc.id}`} className="font-mono font-bold text-primary hover:underline text-xs">
                          {inc.numero}
                        </Link>
                        {inc.ticketProactivanet ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 w-fit">
                            <span className="material-symbols-outlined text-[12px]">confirmation_number</span>
                            <span>{inc.ticketProactivanet}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant/50 italic">Sin Proactivanet</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-on-surface truncate">{inc.titulo}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{inc.categoria || "General"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px] font-semibold text-on-surface">
                          {inc.ambiente || "N/A"}
                        </span>
                        {inc.baseDatos && (
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            DB: {inc.baseDatos}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">{getPriorityBadge(inc.prioridad)}</td>
                    <td className="px-5 py-4">{getStatusBadge(inc.estado)}</td>
                    <td className="px-5 py-4">
                      {inc.assignedTo ? (
                        <span className="font-medium text-on-surface">@{inc.assignedTo.username}</span>
                      ) : (
                        <span className="text-on-surface-variant/60 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5">
                      <Link
                        to={`/incidencias/${inc.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        title="Ver detalle y pasos de solución"
                      >
                        <span>Pasos</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                      <button
                        onClick={() => openEditModal(inc)}
                        className="p-1.5 text-primary hover:bg-primary-container/20 rounded-lg transition-colors cursor-pointer"
                        title="Editar cabecera / solución"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteIncident(inc.id, inc.numero)}
                        className="p-1.5 text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar incidencia"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nueva Incidencia / Solución */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Nueva Incidencia o Solución"
        subtitle="Registra el ticket de cabecera con sus datos técnicos y número de Proactivanet"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Título del Incidente / Caso *
              </label>
              <input
                type="text"
                required
                value={newIncident.titulo}
                onChange={(e) => setNewIncident({ ...newIncident, titulo: e.target.value })}
                placeholder="Ej: Falla en sincronización de pagos en base de datos transaccional"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">confirmation_number</span>
                <span>Ticket Proactivanet</span>
              </label>
              <input
                type="text"
                value={newIncident.ticketProactivanet}
                onChange={(e) => setNewIncident({ ...newIncident, ticketProactivanet: e.target.value })}
                placeholder="Ej: PR-104928"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Descripción Detallada *
            </label>
            <textarea
              required
              rows={3}
              value={newIncident.descripcion}
              onChange={(e) => setNewIncident({ ...newIncident, descripcion: e.target.value })}
              placeholder="Detalla los síntomas, mensajes de error, tablas afectadas y contexto..."
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Estado Inicial
              </label>
              <select
                value={newIncident.estado}
                onChange={(e) => setNewIncident({ ...newIncident, estado: e.target.value as EstadoIncidencia })}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface font-semibold"
              >
                <option value="abierta">Abierta</option>
                <option value="en_proceso">En Proceso</option>
                <option value="resuelta">Resuelta</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Prioridad
              </label>
              <select
                value={newIncident.prioridad}
                onChange={(e) => setNewIncident({ ...newIncident, prioridad: e.target.value as Prioridad })}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Categoría
              </label>
              <input
                type="text"
                value={newIncident.categoria}
                onChange={(e) => setNewIncident({ ...newIncident, categoria: e.target.value })}
                placeholder="Ej: Base de Datos, Redes..."
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Ambiente Afectado
              </label>
              <input
                type="text"
                value={newIncident.ambiente}
                onChange={(e) => setNewIncident({ ...newIncident, ambiente: e.target.value })}
                placeholder="Producción, Staging, QA..."
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Servidor / Host
              </label>
              <input
                type="text"
                value={newIncident.servidor}
                onChange={(e) => setNewIncident({ ...newIncident, servidor: e.target.value })}
                placeholder="srv-db-prod-01"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Base de Datos
              </label>
              <input
                type="text"
                value={newIncident.baseDatos}
                onChange={(e) => setNewIncident({ ...newIncident, baseDatos: e.target.value })}
                placeholder="bd_pagos_prod"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Asignar A
              </label>
              <select
                value={newIncident.asignadoA}
                onChange={(e) => setNewIncident({ ...newIncident, asignadoA: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
              >
                <option value="">-- Sin asignar --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombres} {u.apellidos} (@{u.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Impacto Operativo
              </label>
              <input
                type="text"
                value={newIncident.impacto}
                onChange={(e) => setNewIncident({ ...newIncident, impacto: e.target.value })}
                placeholder="Ej: Afecta procesamiento de 120 órdenes"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
              />
            </div>
          </div>

          {/* Causa Raíz y Solución Inicial */}
          <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 space-y-3">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">lightbulb</span>
              <span>Diagnóstico / Solución Resumida (Opcional)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Causa Raíz</label>
                <textarea
                  rows={2}
                  value={newIncident.causaRaiz}
                  onChange={(e) => setNewIncident({ ...newIncident, causaRaiz: e.target.value })}
                  placeholder="Motivo principal del fallo..."
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Solución Resumida</label>
                <textarea
                  rows={2}
                  value={newIncident.solucionResumida}
                  onChange={(e) => setNewIncident({ ...newIncident, solucionResumida: e.target.value })}
                  placeholder="Resumen del procedimiento de solución..."
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-xs text-on-surface"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingCreate}
              className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingCreate ? "Guardando..." : "Registrar Incidencia"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Incidencia (Cabecera) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingIncident(null);
        }}
        title={`Editar Incidencia: ${editingIncident?.numero || ""}`}
        subtitle="Actualiza el estado, prioridad, Proactivanet, infraestructura y diagnóstico de resolución"
        maxWidth="2xl"
      >
        {editingIncident && (
          <form onSubmit={handleUpdateIncident} className="space-y-4">
            {editError && (
              <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs">
                {editError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={editingIncident.titulo}
                  onChange={(e) => setEditingIncident({ ...editingIncident, titulo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">confirmation_number</span>
                  <span>Ticket Proactivanet</span>
                </label>
                <input
                  type="text"
                  value={editingIncident.ticketProactivanet}
                  onChange={(e) => setEditingIncident({ ...editingIncident, ticketProactivanet: e.target.value })}
                  placeholder="Ej: PR-104928"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Descripción *
              </label>
              <textarea
                required
                rows={3}
                value={editingIncident.descripcion}
                onChange={(e) => setEditingIncident({ ...editingIncident, descripcion: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Estado *
                </label>
                <select
                  value={editingIncident.estado}
                  onChange={(e) => setEditingIncident({ ...editingIncident, estado: e.target.value as EstadoIncidencia })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface font-semibold"
                >
                  <option value="abierta">Abierta</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="resuelta">Resuelta</option>
                  <option value="cerrada">Cerrada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="reabierta">Reabierta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Prioridad *
                </label>
                <select
                  value={editingIncident.prioridad}
                  onChange={(e) => setEditingIncident({ ...editingIncident, prioridad: e.target.value as Prioridad })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  value={editingIncident.categoria}
                  onChange={(e) => setEditingIncident({ ...editingIncident, categoria: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Ambiente
                </label>
                <input
                  type="text"
                  value={editingIncident.ambiente}
                  onChange={(e) => setEditingIncident({ ...editingIncident, ambiente: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Servidor
                </label>
                <input
                  type="text"
                  value={editingIncident.servidor}
                  onChange={(e) => setEditingIncident({ ...editingIncident, servidor: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Base de Datos
                </label>
                <input
                  type="text"
                  value={editingIncident.baseDatos}
                  onChange={(e) => setEditingIncident({ ...editingIncident, baseDatos: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Asignado A
                </label>
                <select
                  value={editingIncident.asignadoA}
                  onChange={(e) => setEditingIncident({ ...editingIncident, asignadoA: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
                >
                  <option value="">-- Sin asignar --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombres} {u.apellidos} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                  Impacto
                </label>
                <input
                  type="text"
                  value={editingIncident.impacto}
                  onChange={(e) => setEditingIncident({ ...editingIncident, impacto: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
                />
              </div>
            </div>

            {/* Causa Raíz y Solución */}
            <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 space-y-3">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Resolución y Diagnóstico de Cierre</span>
              </h4>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Causa Raíz</label>
                <textarea
                  rows={2}
                  value={editingIncident.causaRaiz}
                  onChange={(e) => setEditingIncident({ ...editingIncident, causaRaiz: e.target.value })}
                  placeholder="Causa raíz identificada tras el análisis..."
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Solución Resumida</label>
                <textarea
                  rows={2}
                  value={editingIncident.solucionResumida}
                  onChange={(e) => setEditingIncident({ ...editingIncident, solucionResumida: e.target.value })}
                  placeholder="Resumen de acciones que solucionaron la incidencia..."
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-xs text-on-surface"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingIncident(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingEdit ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
