import { IAuditLogRepository } from "../../domain/repositories/IAuditLogRepository";
import { CreateAuditLogDTO, NivelLog } from "../../domain/entities/AuditLog";
import { PrismaAuditLogRepository } from "../database/repositories/PrismaAuditLogRepository";
import { Request } from "express";
import { AuthenticatedRequest } from "../../shared/types";

export class AuditLogService {
  private repo: IAuditLogRepository;

  constructor() {
    this.repo = new PrismaAuditLogRepository();
  }

  async log(data: CreateAuditLogDTO): Promise<void> {
    try {
      await this.repo.create({ exitoso: true, nivel: "info", ...data });
    } catch (err) {
      console.error("[AuditLog] Error writing audit log:", err);
    }
  }

  async logFromRequest(
    req: AuthenticatedRequest,
    accion: string,
    opts: {
      modulo?: string;
      entidad?: string;
      entidadId?: string;
      valorAnterior?: unknown;
      valorNuevo?: unknown;
      descripcion?: string;
      nivel?: NivelLog;
      exitoso?: boolean;
      detalleError?: string;
    } = {},
  ): Promise<void> {
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket?.remoteAddress ??
      undefined;

    await this.log({
      userId:        req.user?.userId,
      sessionId:     req.user?.sessionId,
      accion,
      ipAddress,
      userAgent:     req.headers["user-agent"],
      nivel:         opts.nivel ?? "info",
      modulo:        opts.modulo,
      entidad:       opts.entidad,
      entidadId:     opts.entidadId,
      valorAnterior: opts.valorAnterior,
      valorNuevo:    opts.valorNuevo,
      descripcion:   opts.descripcion,
      exitoso:       opts.exitoso ?? true,
      detalleError:  opts.detalleError,
    });
  }
}

export const auditLogService = new AuditLogService();
