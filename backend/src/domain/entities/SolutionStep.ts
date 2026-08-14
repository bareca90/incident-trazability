export type TipoPaso = "consulta_sql" | "comando" | "nota" | "archivo" | "configuracion" | "diagnostico" | "rollback" | "otro";
export type TipoAdjunto = "imagen" | "documento" | "script" | "log" | "comprimido" | "otro";

export interface SolutionStepEntity {
  id: string;
  incidentId: string;
  numeroPaso: number;
  tipo: TipoPaso;
  titulo: string;
  descripcion?: string | null;
  contenido?: string | null;
  ambiente?: string | null;
  servidor?: string | null;
  baseDatos?: string | null;
  usuarioDb?: string | null;
  resultado?: string | null;
  exitoso?: boolean | null;
  tiempoEjecucionMs?: number | null;
  version: number;
  esRollback: boolean;
  ejecutadoPor?: string | null;
  revisadoPor?: string | null;
  fechaEjecucion?: Date | null;
  fechaRevision?: Date | null;
  notasInternas?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSolutionStepDTO {
  tipo: TipoPaso;
  titulo: string;
  descripcion?: string;
  contenido?: string;
  ambiente?: string;
  servidor?: string;
  baseDatos?: string;
  usuarioDb?: string;
  resultado?: string;
  exitoso?: boolean;
  tiempoEjecucionMs?: number;
  esRollback?: boolean;
  ejecutadoPor?: string;
  notasInternas?: string;
  metadata?: Record<string, unknown>;
  fechaEjecucion?: Date;
}

export interface StepAttachmentEntity {
  id: string;
  stepId: string;
  tipo: TipoAdjunto;
  nombreOriginal: string;
  nombreStorage: string;
  rutaStorage: string;
  mimeType?: string | null;
  tamanoBytes?: bigint | null;
  checksumSha256?: string | null;
  descripcion?: string | null;
  subidoPor?: string | null;
  createdAt: Date;
}
