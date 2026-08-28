import { prisma } from "../prisma/client";
import { IIncidentRepository, IncidentFilters } from "../../../domain/repositories/IIncidentRepository";
import { CreateIncidentDTO, IncidentEntity, UpdateIncidentDTO } from "../../../domain/entities/Incident";
import { PaginatedResult } from "../../../shared/types";

export class PrismaIncidentRepository implements IIncidentRepository {
  private toEntity(i: any): IncidentEntity {
    return i as IncidentEntity;
  }

  private async generateNumero(): Promise<string> {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const datePrefix = `INC-${yyyy}${mm}${dd}`;

    const count = await prisma.incident.count({
      where: {
        numero: { startsWith: datePrefix },
      },
    });

    const seq = String(count + 1).padStart(4, "0");
    return `${datePrefix}-${seq}`;
  }

  async findAll(page: number, limit: number, filters: IncidentFilters = {}): Promise<PaginatedResult<IncidentEntity>> {
    const where: any = { deletedAt: null };
    if (filters.estado)      where.estado      = filters.estado;
    if (filters.prioridad)   where.prioridad   = filters.prioridad;
    if (filters.categoria)   where.categoria   = { contains: filters.categoria, mode: "insensitive" };
    if (filters.asignadoA)   where.asignadoA   = filters.asignadoA;
    if (filters.reportadoPor) where.reportadoPor = filters.reportadoPor;
    if (filters.desde || filters.hasta) {
      where.fechaReporte = {};
      if (filters.desde) where.fechaReporte.gte = filters.desde;
      if (filters.hasta) where.fechaReporte.lte = filters.hasta;
    }
    if (filters.search) {
      where.OR = [
        { titulo:             { contains: filters.search, mode: "insensitive" } },
        { descripcion:        { contains: filters.search, mode: "insensitive" } },
        { numero:             { contains: filters.search, mode: "insensitive" } },
        { ticketProactivanet: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.incident.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { fechaReporte: "desc" },
        include: {
          reportedBy: { select: { id: true, username: true, nombres: true, apellidos: true } },
          assignedTo:  { select: { id: true, username: true, nombres: true, apellidos: true } },
          sistema:     { select: { id: true, codigo: true, nombre: true } },
        },
      }),
      prisma.incident.count({ where }),
    ]);
    return { data: data.map(this.toEntity), total, page, limit };
  }

  async findById(id: string, includeSteps = false): Promise<IncidentEntity | null> {
    const i = await prisma.incident.findFirst({
      where: { id, deletedAt: null },
      include: {
        reportedBy: { select: { id: true, username: true, nombres: true, apellidos: true } },
        assignedTo:  { select: { id: true, username: true, nombres: true, apellidos: true } },
        sistema:     { select: { id: true, codigo: true, nombre: true } },
        steps: includeSteps
          ? { orderBy: { numeroPaso: "asc" }, include: { attachments: true, executedBy: { select: { id: true, username: true } } } }
          : false,
      },
    });
    return i ? this.toEntity(i) : null;
  }

  async findByNumero(numero: string): Promise<IncidentEntity | null> {
    const i = await prisma.incident.findFirst({
      where: { numero, deletedAt: null },
      include: {
        reportedBy: { select: { id: true, username: true, nombres: true, apellidos: true } },
        assignedTo:  { select: { id: true, username: true, nombres: true, apellidos: true } },
        sistema:     { select: { id: true, codigo: true, nombre: true } },
      },
    });
    return i ? this.toEntity(i) : null;
  }

  async create(data: CreateIncidentDTO & { reportadoPor: string }): Promise<IncidentEntity> {
    const generatedNumero = await this.generateNumero();
    const i = await prisma.incident.create({
      data: {
        numero:                  data.numero || generatedNumero,
        titulo:                  data.titulo,
        descripcion:             data.descripcion,
        estado:                  (data.estado as any) ?? "abierta",
        prioridad:               (data.prioridad as any) ?? "media",
        categoria:               data.categoria,
        subcategoria:            data.subcategoria,
        ambiente:                data.ambiente,
        servidor:                data.servidor,
        baseDatos:               data.baseDatos,
        sistemaId:               data.sistemaId,
        departamentoSolicitante: data.departamentoSolicitante,
        reportadoPor:            data.reportadoPor,
        asignadoA:               data.asignadoA,
        impacto:                 data.impacto,
        causaRaiz:               data.causaRaiz,
        solucionResumida:        data.solucionResumida,
        ticketProactivanet:      data.ticketProactivanet,
        etiquetas:               data.etiquetas ?? [],
        metadata:                data.metadata as any,
        incidentPadre:           data.incidentPadre,
      },
    });
    return this.findById(i.id) as Promise<IncidentEntity>;
  }

  async update(id: string, data: UpdateIncidentDTO): Promise<IncidentEntity> {
    await prisma.incident.update({ where: { id }, data: data as any });
    return this.findById(id) as Promise<IncidentEntity>;
  }

  async softDelete(id: string): Promise<void> {
    await prisma.incident.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

