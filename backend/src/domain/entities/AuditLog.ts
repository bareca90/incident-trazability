export type NivelLog = "info" | "warning" | "error" | "critico" | "debug";

export interface AuditLogEntity {
  id: bigint;
  userId?: string | null;
  sessionId?: string | null;
  nivel: NivelLog;
  modulo?: string | null;
  accion: string;
  descripcion?: string | null;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
  entidad?: string | null;
  entidadId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  exitoso: boolean;
  detalleError?: string | null;
  duracionMs?: number | null;
  createdAt: Date;
}

export interface CreateAuditLogDTO {
  userId?: string;
  sessionId?: string;
  nivel?: NivelLog;
  modulo?: string;
  accion: string;
  descripcion?: string;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
  entidad?: string;
  entidadId?: string;
  ipAddress?: string;
  userAgent?: string;
  exitoso?: boolean;
  detalleError?: string;
  duracionMs?: number;
}
