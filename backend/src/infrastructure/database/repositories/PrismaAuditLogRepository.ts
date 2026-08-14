import { prisma } from "../prisma/client";
import { IAuditLogRepository, AuditLogFilters } from "../../../domain/repositories/IAuditLogRepository";
import { CreateAuditLogDTO, AuditLogEntity } from "../../../domain/entities/AuditLog";
import { PaginatedResult } from "../../../shared/types";

export class PrismaAuditLogRepository implements IAuditLogRepository {
  async create(data: CreateAuditLogDTO): Promise<AuditLogEntity> {
    return prisma.auditLog.create({ data: data as any }) as any;
  }

  async findAll(page: number, limit: number, filters: AuditLogFilters = {}): Promise<PaginatedResult<AuditLogEntity>> {
    const where: any = {};
    if (filters.userId)   where.userId   = filters.userId;
    if (filters.entidad)  where.entidad  = filters.entidad;
    if (filters.nivel)    where.nivel    = filters.nivel;
    if (filters.exitoso !== undefined) where.exitoso = filters.exitoso;
    if (filters.accion)   where.accion   = { contains: filters.accion, mode: "insensitive" };
    if (filters.desde || filters.hasta) {
      where.createdAt = {};
      if (filters.desde) where.createdAt.gte = filters.desde;
      if (filters.hasta) where.createdAt.lte = filters.hasta;
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, username: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data: data as any, total, page, limit };
  }
}
