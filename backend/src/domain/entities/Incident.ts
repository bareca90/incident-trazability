export type EstadoIncidencia = "abierta" | "en_proceso" | "resuelta" | "cerrada" | "cancelada" | "reabierta";
export type Prioridad = "baja" | "media" | "alta" | "critica";

export interface IncidentEntity {
  id: string;
  numero: string;
  titulo: string;
  descripcion: string;
  estado: EstadoIncidencia;
  prioridad: Prioridad;
  categoria?: string | null;
  subcategoria?: string | null;
  ambiente?: string | null;
  servidor?: string | null;
  baseDatos?: string | null;
  reportadoPor: string;
  asignadoA?: string | null;
  fechaReporte: Date;
  fechaInicio?: Date | null;
  fechaResolucion?: Date | null;
  fechaCierre?: Date | null;
  tiempoResolucionMin?: number | null;
  impacto?: string | null;
  causaRaiz?: string | null;
  solucionResumida?: string | null;
  ticketProactivanet?: string | null;
  esRecurrente: boolean;
  incidentPadre?: string | null;
  etiquetas: string[];
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateIncidentDTO {
  numero?: string;
  titulo: string;
  descripcion: string;
  estado?: EstadoIncidencia;
  prioridad?: Prioridad;
  categoria?: string;
  subcategoria?: string;
  ambiente?: string;
  servidor?: string;
  baseDatos?: string;
  asignadoA?: string;
  impacto?: string;
  causaRaiz?: string;
  solucionResumida?: string;
  ticketProactivanet?: string;
  etiquetas?: string[];
  metadata?: Record<string, unknown>;
  incidentPadre?: string;
}

export interface UpdateIncidentDTO extends Partial<CreateIncidentDTO> {
  estado?: EstadoIncidencia;
  causaRaiz?: string;
  solucionResumida?: string;
  ticketProactivanet?: string;
  fechaInicio?: Date;
  fechaResolucion?: Date;
  fechaCierre?: Date;
  esRecurrente?: boolean;
}
