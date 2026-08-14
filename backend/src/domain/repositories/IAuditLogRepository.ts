import { CreateAuditLogDTO, AuditLogEntity } from "../entities/AuditLog";
import { PaginatedResult } from "../../shared/types";

export interface AuditLogFilters {
  userId?: string;
  entidad?: string;
  accion?: string;
  nivel?: string;
  desde?: Date;
  hasta?: Date;
  exitoso?: boolean;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogDTO): Promise<AuditLogEntity>;
  findAll(page: number, limit: number, filters?: AuditLogFilters): Promise<PaginatedResult<AuditLogEntity>>;
}
