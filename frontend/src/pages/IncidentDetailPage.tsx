import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { incidentService, solutionStepService, userService, systemService } from "../services/api";
import { Incident, SolutionStep, TipoPaso, User, System, EstadoIncidencia } from "../types";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [steps, setSteps] = useState<SolutionStep[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);

  // Modal Editar Incidencia (Cabecera)
  const [isEditIncidentModalOpen, setIsEditIncidentModalOpen] = useState(false);
  const [editIncidentError, setEditIncidentError] = useState<string | null>(null);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [incidentForm, setIncidentForm] = useState<{
    titulo: string;
    descripcion: string;
    estado: EstadoIncidencia;
    sistemaId: number;
    departamentoSolicitante: string;
    servidor: string;
    baseDatos: string;
    asignadoA: string;
    impacto: string;
    causaRaiz: string;
    solucionResumida: string;
    ticketProactivanet: string;
  }>({
    titulo: "",
    descripcion: "",
    estado: "abierta",
    sistemaId: 0,
    departamentoSolicitante: "",
    servidor: "",
    baseDatos: "",
    asignadoA: "",
    impacto: "",
    causaRaiz: "",
    solucionResumida: "",
    ticketProactivanet: "",
  });

  // Modal para Agregar/Editar Paso (Detalle)
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [stepForm, setStepForm] = useState<{
    tipo: TipoPaso;
    titulo: string;
    descripcion: string;
    contenido: string;
    ambiente: string;
    servidor: string;
    baseDatos: string;
    usuarioDb: string;
    resultado: string;
    exitoso: boolean;
    tiempoEjecucionMs: string;
    esRollback: boolean;
    notasInternas: string;
  }>({
    tipo: "consulta_sql",
    titulo: "",
    descripcion: "",
    contenido: "",
    ambiente: "Producción",
    servidor: "",
    baseDatos: "",
    usuarioDb: "",
    resultado: "",
    exitoso: true,
    tiempoEjecucionMs: "",
    esRollback: false,
    notasInternas: "",
  });

  // Modal para Subir Adjunto a Paso
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [selectedStepIdForAttachment, setSelectedStepIdForAttachment] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [attachmentDesc, setAttachmentDesc] = useState("");
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadIncidentDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const incRes = await incidentService.getById(id);
      if (incRes.success) {
        setIncident(incRes.data);
      }

      const stepsRes = await solutionStepService.getByIncident(id);
      if (stepsRes.success) {
        setSteps(stepsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidentDetail();
    userService.getAll().then((res) => {
      if (res.success) setUsers(res.data);
    });
    systemService.getAll().then((res) => {
      if (res.success) setSystems(res.data);
    });
  }, [id]);

  const openEditIncidentModal = () => {
    if (!incident) return;
    setIncidentForm({
      titulo: incident.titulo,
      descripcion: incident.descripcion,
      estado: incident.estado,
      sistemaId: incident.sistemaId || 0,
      departamentoSolicitante: incident.departamentoSolicitante || "",
      servidor: incident.servidor || "",
      baseDatos: incident.baseDatos || "",
      asignadoA: incident.asignadoA || "",
      impacto: incident.impacto || "",
      causaRaiz: incident.causaRaiz || "",
      solucionResumida: incident.solucionResumida || "",
      ticketProactivanet: incident.ticketProactivanet || "",
    });
    setEditIncidentError(null);
    setIsEditIncidentModalOpen(true);
  };

  const handleUpdateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingIncident(true);
    setEditIncidentError(null);
    try {
      const payload: Partial<Incident> = {
        titulo: incidentForm.titulo,
        descripcion: incidentForm.descripcion,
        estado: incidentForm.estado,
        sistemaId: incidentForm.sistemaId ? Number(incidentForm.sistemaId) : undefined,
        departamentoSolicitante: incidentForm.departamentoSolicitante || undefined,
        servidor: incidentForm.servidor || undefined,
        baseDatos: incidentForm.baseDatos || undefined,
        asignadoA: incidentForm.asignadoA || undefined,
        impacto: incidentForm.impacto || undefined,
        causaRaiz: incidentForm.causaRaiz || undefined,
        solucionResumida: incidentForm.solucionResumida || undefined,
        ticketProactivanet: incidentForm.ticketProactivanet || undefined,
        fechaResolucion:
          incidentForm.estado === "resuelta" || incidentForm.estado === "cerrada"
            ? new Date().toISOString()
            : undefined,
      };
      const res = await incidentService.update(id, payload);
      if (res.success) {
        setIsEditIncidentModalOpen(false);
        loadIncidentDetail();
      } else {
        setEditIncidentError(res.message || "Error al actualizar la incidencia");
      }
    } catch (err: any) {
      console.error(err);
      setEditIncidentError(err.response?.data?.message || err.message || "Error al actualizar la incidencia");
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const openCreateStepModal = () => {
    setEditingStepId(null);
    setStepForm({
      tipo: "consulta_sql",
      titulo: "",
      descripcion: "",
      contenido: "",
      ambiente: incident?.ambiente || "Producción",
      servidor: incident?.servidor || "",
      baseDatos: incident?.baseDatos || "",
      usuarioDb: "",
      resultado: "",
      exitoso: true,
      tiempoEjecucionMs: "",
      esRollback: false,
      notasInternas: "",
    });
    setStepError(null);
    setIsStepModalOpen(true);
  };

  const openEditStepModal = (step: SolutionStep) => {
    setEditingStepId(step.id);
    setStepForm({
      tipo: step.tipo,
      titulo: step.titulo,
      descripcion: step.descripcion || "",
      contenido: step.contenido || "",
      ambiente: step.ambiente || "",
      servidor: step.servidor || "",
      baseDatos: step.baseDatos || "",
      usuarioDb: step.usuarioDb || "",
      resultado: step.resultado || "",
      exitoso: step.exitoso ?? true,
      tiempoEjecucionMs: step.tiempoEjecucionMs ? String(step.tiempoEjecucionMs) : "",
      esRollback: step.esRollback || false,
      notasInternas: step.notasInternas || "",
    });
    setStepError(null);
    setIsStepModalOpen(true);
  };

  const handleInsertSnippet = (snippet: string) => {
    setStepForm((prev) => ({
      ...prev,
      contenido: prev.contenido ? `${prev.contenido}\n${snippet}` : snippet,
    }));
  };

  const handleCopyCode = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepId(stepId);
    setTimeout(() => setCopiedStepId(null), 2000);
  };

  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingStep(true);
    setStepError(null);

    try {
      const payload: Partial<SolutionStep> = {
        tipo: stepForm.tipo,
        titulo: stepForm.titulo,
        descripcion: stepForm.descripcion || undefined,
        contenido: stepForm.contenido || undefined,
        ambiente: stepForm.ambiente || undefined,
        servidor: stepForm.servidor || undefined,
        baseDatos: stepForm.baseDatos || undefined,
        usuarioDb: stepForm.usuarioDb || undefined,
        resultado: stepForm.resultado || undefined,
        exitoso: stepForm.exitoso,
        tiempoEjecucionMs: stepForm.tiempoEjecucionMs ? parseInt(stepForm.tiempoEjecucionMs) : undefined,
        esRollback: stepForm.esRollback,
        notasInternas: stepForm.notasInternas || undefined,
        fechaEjecucion: new Date().toISOString(),
      };

      if (editingStepId) {
        await solutionStepService.update(editingStepId, payload);
      } else {
        await solutionStepService.create(id, payload);
      }

      setIsStepModalOpen(false);
      setEditingStepId(null);
      loadIncidentDetail();
    } catch (err: any) {
      console.error(err);
      setStepError(err.response?.data?.message || err.message || "Error al guardar el paso");
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStepIdForAttachment || !fileToUpload) return;
    setIsUploading(true);
    setAttachmentError(null);

    try {
      await solutionStepService.uploadAttachment(
        selectedStepIdForAttachment,
        fileToUpload,
        attachmentDesc || undefined
      );
      setIsAttachmentModalOpen(false);
      setFileToUpload(null);
      setAttachmentDesc("");
      loadIncidentDetail();
    } catch (err: any) {
      console.error(err);
      setAttachmentError(err.response?.data?.message || err.message || "Error al subir el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm("¿Deseas eliminar este paso de solución?")) return;
    try {
      await solutionStepService.delete(stepId);
      loadIncidentDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("¿Deseas eliminar este archivo adjunto?")) return;
    try {
      await solutionStepService.deleteAttachment(attachmentId);
      loadIncidentDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const getStepIcon = (tipo: TipoPaso) => {
    switch (tipo) {
      case "consulta_sql":  return "database";
      case "comando":       return "terminal";
      case "nota":          return "notes";
      case "archivo":       return "attach_file";
      case "configuracion": return "tune";
      case "diagnostico":   return "health_metrics";
      case "rollback":      return "undo";
      default:              return "code";
    }
  };

  const formatFileSize = (bytes?: number | string) => {
    if (!bytes) return "";
    const b = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (isNaN(b)) return "";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">search_off</span>
        <p className="text-sm font-semibold">Incidencia no encontrada</p>
        <Link to="/incidencias" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/incidencias" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Volver a Incidencias</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-primary">{incident.numero}</span>
        </div>

        <button
          onClick={openEditIncidentModal}
          className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl border border-outline-variant/30 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base text-primary">edit_note</span>
          <span>Editar Cabecera / Solución</span>
        </button>
      </div>

      {/* Incident Header Card */}
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-primary px-3 py-1 bg-primary-container/20 rounded-lg">
                {incident.numero}
              </span>
              {incident.ticketProactivanet && (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-lg border border-teal-300 dark:border-teal-800 shadow-xs">
                  <span className="material-symbols-outlined text-sm">confirmation_number</span>
                  <span>Ticket Proactivanet: {incident.ticketProactivanet}</span>
                </span>
              )}
              {getStatusBadge(incident.estado)}
              {getPriorityBadge(incident.prioridad)}
            </div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">{incident.titulo}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateStepModal}
              className="px-4 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add_task</span>
              <span>Agregar Paso de Solución</span>
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-surface-container-low rounded-xl">
            <p className="text-on-surface-variant font-medium">Categoría</p>
            <p className="font-semibold text-on-surface mt-1">{incident.categoria || "General"}</p>
          </div>
          <div className="p-3.5 bg-surface-container-low rounded-xl">
            <p className="text-on-surface-variant font-medium">Ambiente / Host / BD</p>
            <p className="font-semibold text-on-surface mt-1">
              {incident.ambiente || "N/A"} {incident.servidor ? `(${incident.servidor})` : ""}
              {incident.baseDatos ? ` • DB: ${incident.baseDatos}` : ""}
            </p>
          </div>
          <div className="p-3.5 bg-surface-container-low rounded-xl">
            <p className="text-on-surface-variant font-medium">Asignado A / Reportado Por</p>
            <p className="font-semibold text-on-surface mt-1">
              {incident.assignedTo ? `@${incident.assignedTo.username}` : "Sin asignar"} (Rep: @{incident.reportedBy?.username})
            </p>
          </div>
          <div className="p-3.5 bg-surface-container-low rounded-xl">
            <p className="text-on-surface-variant font-medium">Fecha de Reporte</p>
            <p className="font-semibold text-on-surface mt-1">
              {new Date(incident.fechaReporte).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Description Box */}
        <div>
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Descripción Inicial del Problema
          </h4>
          <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 text-xs text-on-surface whitespace-pre-wrap leading-relaxed">
            {incident.descripcion}
          </div>
        </div>

        {/* Diagnosis & Resolution Summary Banner */}
        {(incident.causaRaiz || incident.solucionResumida || incident.estado === "resuelta" || incident.estado === "cerrada") && (
          <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-lg">verified</span>
              <span>Diagnóstico y Solución Registrada</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {incident.causaRaiz && (
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                  <p className="font-semibold text-on-surface-variant text-[11px] uppercase mb-1">Causa Raíz:</p>
                  <p className="text-on-surface whitespace-pre-wrap">{incident.causaRaiz}</p>
                </div>
              )}
              {incident.solucionResumida && (
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                  <p className="font-semibold text-on-surface-variant text-[11px] uppercase mb-1">Solución Resumida:</p>
                  <p className="text-on-surface whitespace-pre-wrap">{incident.solucionResumida}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Solution Steps Timeline */}
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Detalle de Pasos de Solución</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Historial de consultas SQL, scripts, comandos y notas técnicas ejecutadas
            </p>
          </div>
          <span className="px-3 py-1 bg-surface-container font-mono text-xs font-bold rounded-full text-primary">
            {steps.length} {steps.length === 1 ? "paso" : "pasos"}
          </span>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-outline-variant/30 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">checklist</span>
            <p className="text-sm font-semibold text-on-surface">Sin pasos registrados aún</p>
            <p className="text-xs text-on-surface-variant mt-1">Comienza agregando el primer paso técnico o consulta SQL</p>
            <button
              onClick={openCreateStepModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Agregar Primer Paso</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40">
            {steps.map((step) => (
              <div key={step.id} className="relative pl-12 group">
                {/* Timeline Circle */}
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center text-on-primary font-bold shadow-md z-10 ${
                  step.esRollback ? "bg-amber-600" : "bg-primary"
                }`}>
                  <span className="material-symbols-outlined text-xl">{getStepIcon(step.tipo)}</span>
                </div>

                {/* Step Card */}
                <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-2xl p-5 hover:border-primary/40 transition-all shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-surface-container-highest rounded text-on-surface-variant">
                        Paso #{step.numeroPaso}
                      </span>
                      <h4 className="font-bold text-sm text-on-surface">{step.titulo}</h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-surface-container rounded uppercase text-primary font-medium">
                        {step.tipo}
                      </span>
                      {step.esRollback && <Badge variant="warning">Rollback</Badge>}
                      {step.exitoso !== undefined && (
                        <Badge variant={step.exitoso ? "success" : "danger"}>
                          {step.exitoso ? "Exitoso" : "Fallido"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditStepModal(step)}
                        className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold rounded-lg border border-outline-variant/30 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Editar paso"
                      >
                        <span className="material-symbols-outlined text-sm text-primary">edit</span>
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStepIdForAttachment(step.id);
                          setFileToUpload(null);
                          setAttachmentDesc("");
                          setAttachmentError(null);
                          setIsAttachmentModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold rounded-lg border border-outline-variant/30 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Adjuntar archivo"
                      >
                        <span className="material-symbols-outlined text-sm">attach_file</span>
                        <span>Adjuntar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar paso"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>

                  {step.descripcion && (
                    <p className="text-xs text-on-surface-variant">{step.descripcion}</p>
                  )}

                  {/* Metadata Chips (DB, Servidor, Usuario) */}
                  {(step.baseDatos || step.servidor || step.usuarioDb || step.tiempoEjecucionMs) && (
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono text-on-surface-variant">
                      {step.baseDatos && (
                        <span className="px-2 py-0.5 bg-surface-container rounded border border-outline-variant/20">
                          📦 BD: {step.baseDatos}
                        </span>
                      )}
                      {step.servidor && (
                        <span className="px-2 py-0.5 bg-surface-container rounded border border-outline-variant/20">
                          🖥️ Servidor: {step.servidor}
                        </span>
                      )}
                      {step.usuarioDb && (
                        <span className="px-2 py-0.5 bg-surface-container rounded border border-outline-variant/20">
                          👤 Usuario DB: {step.usuarioDb}
                        </span>
                      )}
                      {step.tiempoEjecucionMs && (
                        <span className="px-2 py-0.5 bg-surface-container rounded border border-outline-variant/20">
                          ⏱️ {step.tiempoEjecucionMs} ms
                        </span>
                      )}
                    </div>
                  )}

                  {/* Code Editor Style Window */}
                  {step.contenido && (
                    <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-[#12161f] shadow-md">
                      {/* Window Header */}
                      <div className="flex items-center justify-between px-3.5 py-2 bg-[#1a202c] border-b border-slate-700/50 text-[11px] font-mono text-slate-300">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 mr-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                          </div>
                          <span className="text-sky-400 font-semibold uppercase">{step.tipo}</span>
                          {step.baseDatos && <span className="text-slate-400">@ {step.baseDatos}</span>}
                        </div>
                        <button
                          onClick={() => handleCopyCode(step.contenido!, step.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded text-[10px] text-slate-200 transition-colors cursor-pointer"
                          title="Copiar código"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {copiedStepId === step.id ? "check" : "content_copy"}
                          </span>
                          <span>{copiedStepId === step.id ? "¡Copiado!" : "Copiar"}</span>
                        </button>
                      </div>

                      {/* Code Content */}
                      <div className="p-4 overflow-x-auto text-emerald-300 font-mono text-xs leading-relaxed selection:bg-sky-900 selection:text-white">
                        <pre className="whitespace-pre-wrap">{step.contenido}</pre>
                      </div>
                    </div>
                  )}

                  {/* Execution Result */}
                  {step.resultado && (
                    <div className="p-3 bg-surface-container-highest/60 rounded-xl text-xs font-mono text-on-surface-variant border border-outline-variant/20">
                      <span className="font-sans font-bold text-[10px] uppercase text-primary block mb-1">Resultado Obtenido:</span>
                      <pre className="whitespace-pre-wrap font-mono text-xs">{step.resultado}</pre>
                    </div>
                  )}

                  {/* Internal notes */}
                  {step.notasInternas && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-semibold text-[10px] uppercase block">Nota Interna:</span>
                      {step.notasInternas}
                    </div>
                  )}

                  {/* Attachments List */}
                  {step.attachments && step.attachments.length > 0 && (
                    <div className="pt-3 border-t border-outline-variant/20">
                      <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-2">
                        Archivos Adjuntos de Soporte ({step.attachments.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {step.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-xs shadow-xs"
                          >
                            <a
                              href={`/uploads/${att.nombreStorage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 min-w-0 flex-1 hover:text-primary transition-colors"
                              title={`Descargar / Ver: ${att.nombreOriginal}`}
                            >
                              <span className="material-symbols-outlined text-base text-primary">
                                {att.tipo === "imagen" ? "image" : att.tipo === "script" ? "terminal" : "description"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-on-surface truncate text-xs">{att.nombreOriginal}</p>
                                {att.tamanoBytes && (
                                  <p className="text-[10px] text-on-surface-variant font-mono">
                                    {formatFileSize(att.tamanoBytes)}
                                  </p>
                                )}
                              </div>
                            </a>
                            <button
                              onClick={() => handleDeleteAttachment(att.id)}
                              className="p-1 text-on-surface-variant/60 hover:text-error transition-colors rounded-lg cursor-pointer"
                              title="Eliminar adjunto"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar Incidencia (Cabecera) */}
      <Modal
        isOpen={isEditIncidentModalOpen}
        onClose={() => setIsEditIncidentModalOpen(false)}
        title={`Editar Cabecera: ${incident.numero}`}
        subtitle="Actualiza el estado, prioridad, Proactivanet, infraestructura y diagnóstico de resolución"
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdateIncident} className="space-y-4">
          {editIncidentError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs">
              {editIncidentError}
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
                value={incidentForm.titulo}
                onChange={(e) => setIncidentForm({ ...incidentForm, titulo: e.target.value })}
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
                value={incidentForm.ticketProactivanet}
                onChange={(e) => setIncidentForm({ ...incidentForm, ticketProactivanet: e.target.value })}
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
              value={incidentForm.descripcion}
              onChange={(e) => setIncidentForm({ ...incidentForm, descripcion: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Estado *
              </label>
              <select
                value={incidentForm.estado}
                onChange={(e) => setIncidentForm({ ...incidentForm, estado: e.target.value as EstadoIncidencia })}
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
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">dns</span>
                <span>Sistema Afectado</span>
              </label>
              <select
                value={incidentForm.sistemaId}
                onChange={(e) => setIncidentForm({ ...incidentForm, sistemaId: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface font-semibold"
              >
                <option value={0}>-- Seleccionar sistema --</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">domain</span>
                <span>Departamento Solicitante</span>
              </label>
              <input
                type="text"
                value={incidentForm.departamentoSolicitante}
                onChange={(e) => setIncidentForm({ ...incidentForm, departamentoSolicitante: e.target.value })}
                placeholder="Ej: Finanzas, Operaciones..."
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Servidor
              </label>
              <input
                type="text"
                value={incidentForm.servidor}
                onChange={(e) => setIncidentForm({ ...incidentForm, servidor: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Base de Datos
              </label>
              <input
                type="text"
                value={incidentForm.baseDatos}
                onChange={(e) => setIncidentForm({ ...incidentForm, baseDatos: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Asignado A
              </label>
              <select
                value={incidentForm.asignadoA}
                onChange={(e) => setIncidentForm({ ...incidentForm, asignadoA: e.target.value })}
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Impacto
            </label>
            <input
              type="text"
              value={incidentForm.impacto}
              onChange={(e) => setIncidentForm({ ...incidentForm, impacto: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
            />
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
                value={incidentForm.causaRaiz}
                onChange={(e) => setIncidentForm({ ...incidentForm, causaRaiz: e.target.value })}
                placeholder="Causa raíz identificada tras el análisis..."
                className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-xs font-mono font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Solución Resumida</label>
              <textarea
                rows={2}
                value={incidentForm.solucionResumida}
                onChange={(e) => setIncidentForm({ ...incidentForm, solucionResumida: e.target.value })}
                placeholder="Resumen de acciones que solucionaron la incidencia..."
                className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-xs font-mono font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditIncidentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingIncident}
              className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingIncident ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Crear / Editar Paso de Solución con Editor de Código */}
      <Modal
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        title={editingStepId ? "Editar Paso de Solución" : "Agregar Nuevo Paso de Solución"}
        subtitle="Registra las consultas SQL, scripts, comandos o notas técnicas con editor de código integrado"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveStep} className="space-y-4">
          {stepError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs">
              {stepError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Tipo de Paso *
              </label>
              <select
                value={stepForm.tipo}
                onChange={(e) => setStepForm({ ...stepForm, tipo: e.target.value as TipoPaso })}
                className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface font-semibold"
              >
                <option value="consulta_sql">⚡ Consulta SQL</option>
                <option value="comando">💻 Comando / Script</option>
                <option value="nota">📝 Nota Técnica</option>
                <option value="configuracion">⚙️ Configuración</option>
                <option value="diagnostico">🩺 Diagnóstico</option>
                <option value="rollback">🔄 Rollback / Reversión</option>
                <option value="otro">📁 Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                Título del Paso *
              </label>
              <input
                type="text"
                required
                value={stepForm.titulo}
                onChange={(e) => setStepForm({ ...stepForm, titulo: e.target.value })}
                placeholder="Ej: UPDATE estado de órdenes pendientes"
                className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Descripción Explicativa
            </label>
            <input
              type="text"
              value={stepForm.descripcion}
              onChange={(e) => setStepForm({ ...stepForm, descripcion: e.target.value })}
              placeholder="Ej: Corrección de registros inconsistentes con saldo bloqueado"
              className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
            />
          </div>

          {/* Code Editor Style Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary">code</span>
                <span>Editor de Código / Query SQL / Script</span>
              </label>

              {/* Snippet helpers */}
              {stepForm.tipo === "consulta_sql" && (
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-on-surface-variant/60 font-sans">Plantillas:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet("SELECT * FROM tabla WHERE condicion = 'valor';")}
                    className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono text-[10px] text-primary transition-colors cursor-pointer"
                  >
                    SELECT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet("UPDATE tabla SET estado = 'activo' WHERE id = 123;")}
                    className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono text-[10px] text-primary transition-colors cursor-pointer"
                  >
                    UPDATE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet("BEGIN;\n-- Ejecutar cambios\nCOMMIT;")}
                    className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono text-[10px] text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
                  >
                    TX (BEGIN/COMMIT)
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#12161f] shadow-sm">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a202c] border-b border-slate-700 text-[11px] font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-sky-400 font-semibold">{stepForm.tipo.toUpperCase()}</span>
                  {stepForm.baseDatos && <span className="text-slate-400">@ {stepForm.baseDatos}</span>}
                </div>
                <span className="text-[10px] text-slate-400">Editor Monospace (JetBrains Mono)</span>
              </div>
              <textarea
                rows={6}
                spellCheck={false}
                value={stepForm.contenido}
                onChange={(e) => setStepForm({ ...stepForm, contenido: e.target.value })}
                placeholder="-- Escribe tu consulta SQL, script bash o comando aquí..."
                className="w-full p-3.5 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y selection:bg-sky-900 selection:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Ambiente
              </label>
              <input
                type="text"
                value={stepForm.ambiente}
                onChange={(e) => setStepForm({ ...stepForm, ambiente: e.target.value })}
                placeholder="Producción"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Servidor
              </label>
              <input
                type="text"
                value={stepForm.servidor}
                onChange={(e) => setStepForm({ ...stepForm, servidor: e.target.value })}
                placeholder="db-prod-01"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Base de Datos
              </label>
              <input
                type="text"
                value={stepForm.baseDatos}
                onChange={(e) => setStepForm({ ...stepForm, baseDatos: e.target.value })}
                placeholder="bd_trazabilidad"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Usuario DB
              </label>
              <input
                type="text"
                value={stepForm.usuarioDb}
                onChange={(e) => setStepForm({ ...stepForm, usuarioDb: e.target.value })}
                placeholder="postgres / admin"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                ¿Ejecución Exitosa?
              </label>
              <select
                value={stepForm.exitoso ? "true" : "false"}
                onChange={(e) => setStepForm({ ...stepForm, exitoso: e.target.value === "true" })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs"
              >
                <option value="true">Sí (Exitoso)</option>
                <option value="false">No (Falló / Con Errores)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Tiempo Ejecución (ms)
              </label>
              <input
                type="number"
                value={stepForm.tiempoEjecucionMs}
                onChange={(e) => setStepForm({ ...stepForm, tiempoEjecucionMs: e.target.value })}
                placeholder="Ej: 145"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                ¿Es Rollback / Reversión?
              </label>
              <select
                value={stepForm.esRollback ? "true" : "false"}
                onChange={(e) => setStepForm({ ...stepForm, esRollback: e.target.value === "true" })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs"
              >
                <option value="false">No (Paso Estándar)</option>
                <option value="true">Sí (Procedimiento Rollback)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Resultado Obtenido de la Ejecución
            </label>
            <textarea
              rows={2}
              spellCheck={false}
              value={stepForm.resultado}
              onChange={(e) => setStepForm({ ...stepForm, resultado: e.target.value })}
              placeholder="Ej: UPDATE 120 rows affected in 0.045s"
              className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Notas Internas (Solo equipo técnico)
            </label>
            <input
              type="text"
              value={stepForm.notasInternas}
              onChange={(e) => setStepForm({ ...stepForm, notasInternas: e.target.value })}
              placeholder="Observaciones adicionales, precauciones..."
              className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
            />
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsStepModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingStep}
              className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingStep ? "Guardando..." : "Guardar Paso"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Subir Adjunto */}
      <Modal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        title="Subir Archivo Adjunto al Paso"
        subtitle="Soporta imágenes, scripts SQL, logs, comprimidos y documentos de respaldo"
        maxWidth="md"
      >
        <form onSubmit={handleUploadAttachment} className="space-y-4">
          {attachmentError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs">
              {attachmentError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Seleccionar Archivo *
            </label>
            <input
              type="file"
              required
              onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
              className="w-full text-xs text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container/80 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
              Descripción del Archivo
            </label>
            <input
              type="text"
              value={attachmentDesc}
              onChange={(e) => setAttachmentDesc(e.target.value)}
              placeholder="Ej: Captura de pantalla de la traza de error o script ejecutado"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface"
            />
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAttachmentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading || !fileToUpload}
              className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? "Subiendo..." : "Subir Adjunto"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
