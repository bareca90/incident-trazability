export type EstadoUsuario = "activo" | "inactivo" | "bloqueado" | "pendiente";
export type EstadoIncidencia = "abierta" | "en_proceso" | "resuelta" | "cerrada" | "cancelada" | "reabierta";
export type Prioridad = "baja" | "media" | "alta" | "critica";
export type TipoPaso = "consulta_sql" | "comando" | "nota" | "archivo" | "configuracion" | "diagnostico" | "rollback" | "otro";
export type TipoAdjunto = "imagen" | "documento" | "script" | "log" | "comprimido" | "otro";
export type TipoAcceso = "ver" | "crear" | "editar" | "eliminar" | "exportar" | "aprobar";

export interface UserPermission {
  menuOptionId: number;
  codigoOpcion: string;
  nombreOpcion: string;
  ruta?: string;
  icono?: string;
  menuId: number;
  codigoMenu: string;
  nombreMenu: string;
  acceso: TipoAcceso;
  permitido: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  avatarUrl?: string;
  estado: EstadoUsuario;
  intentosLogin: number;
  ultimoLogin?: string;
  mustChangePwd: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
  isAdmin?: boolean;
  permissions?: UserPermission[];
}

export interface Role {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  esAdmin: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  orden: number;
  activo: boolean;
  parentId?: number;
  options?: MenuOption[];
}

export interface MenuOption {
  id: number;
  menuId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ruta?: string;
  icono?: string;
  orden: number;
  activo: boolean;
  menu?: Menu;
}

export interface RoleOptionAccess {
  id: number;
  roleId: number;
  menuOptionId: number;
  acceso: TipoAcceso;
  permitido: boolean;
  menuOption?: MenuOption;
}

export interface StepAttachment {
  id: string;
  stepId: string;
  tipo: TipoAdjunto;
  nombreOriginal: string;
  nombreStorage: string;
  rutaStorage: string;
  mimeType?: string;
  tamanoBytes?: number | string;
  checksumSha256?: string;
  descripcion?: string;
  subidoPor?: string;
  createdAt: string;
}

export interface SolutionStep {
  id: string;
  incidentId: string;
  numeroPaso: number;
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
  version: number;
  esRollback: boolean;
  ejecutadoPor?: string;
  revisadoPor?: string;
  fechaEjecucion?: string;
  fechaRevision?: string;
  notasInternas?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  attachments?: StepAttachment[];
  executedBy?: { id: string; username: string };
  reviewedBy?: { id: string; username: string };
}

export interface Incident {
  id: string;
  numero: string;
  titulo: string;
  descripcion: string;
  estado: EstadoIncidencia;
  prioridad: Prioridad;
  categoria?: string;
  subcategoria?: string;
  ambiente?: string;
  servidor?: string;
  baseDatos?: string;
  reportadoPor: string;
  asignadoA?: string;
  fechaReporte: string;
  fechaInicio?: string;
  fechaResolucion?: string;
  fechaCierre?: string;
  tiempoResolucionMin?: number;
  impacto?: string;
  causaRaiz?: string;
  solucionResumida?: string;
  ticketProactivanet?: string;
  esRecurrente: boolean;
  incidentPadre?: string;
  etiquetas: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  reportedBy?: { id: string; username: string; nombres: string; apellidos: string };
  assignedTo?: { id: string; username: string; nombres: string; apellidos: string };
  steps?: SolutionStep[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  sessionId?: string;
  nivel: "info" | "warning" | "error" | "critico" | "debug";
  modulo?: string;
  accion: string;
  descripcion?: string;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
  entidad?: string;
  entidadId?: string;
  ipAddress?: string;
  userAgent?: string;
  exitoso: boolean;
  detalleError?: string;
  duracionMs?: number;
  createdAt: string;
  user?: { id: string; username: string; email: string };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
