import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendPaginated } from "../../../shared/utils/response";
import { parsePagination } from "../../../shared/utils/pagination";
import { PrismaAuditLogRepository } from "../../database/repositories/PrismaAuditLogRepository";

const auditRepo = new PrismaAuditLogRepository();

export class AuditLogController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = parsePagination(req);
      const filters = {
        userId:  typeof req.query.userId === "string" ? req.query.userId : undefined,
        entidad: typeof req.query.entidad === "string" ? req.query.entidad : undefined,
        accion:  typeof req.query.accion === "string" ? req.query.accion : undefined,
        nivel:   typeof req.query.nivel === "string" ? req.query.nivel : undefined,
        exitoso: req.query.exitoso !== undefined ? req.query.exitoso === "true" : undefined,
        desde:   req.query.desde ? new Date(String(req.query.desde)) : undefined,
        hasta:   req.query.hasta ? new Date(String(req.query.hasta)) : undefined,
      };
      const result = await auditRepo.findAll(page, limit, filters);
      sendPaginated(res, result.data, result.total, page, limit);
    } catch (err) { next(err); }
  }
}
