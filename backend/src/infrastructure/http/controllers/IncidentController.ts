import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../../../shared/utils/response";
import { parsePagination } from "../../../shared/utils/pagination";
import { PrismaIncidentRepository } from "../../database/repositories/PrismaIncidentRepository";
import { CreateIncidentUseCase } from "../../../use-cases/incidents/CreateIncidentUseCase";
import { UpdateIncidentUseCase } from "../../../use-cases/incidents/UpdateIncidentUseCase";
import { GetIncidentsUseCase } from "../../../use-cases/incidents/GetIncidentsUseCase";
import { DeleteIncidentUseCase } from "../../../use-cases/incidents/DeleteIncidentUseCase";

const incidentRepo = new PrismaIncidentRepository();

const createIncidentSchema = z.object({
  titulo:             z.string().min(5).max(500),
  descripcion:        z.string().min(10),
  estado:             z.enum(["abierta", "en_proceso", "resuelta", "cerrada", "cancelada", "reabierta"]).optional(),
  prioridad:          z.enum(["baja", "media", "alta", "critica"]).optional(),
  categoria:          z.string().optional(),
  subcategoria:       z.string().optional(),
  ambiente:           z.string().optional(),
  servidor:           z.string().optional(),
  baseDatos:          z.string().optional(),
  asignadoA:          z.string().uuid().or(z.literal("")).optional().transform(v => v === "" ? undefined : v),
  impacto:            z.string().optional(),
  causaRaiz:          z.string().optional(),
  solucionResumida:   z.string().optional(),
  ticketProactivanet: z.string().optional(),
  etiquetas:          z.array(z.string()).optional(),
  metadata:           z.record(z.unknown()).optional(),
  incidentPadre:      z.string().uuid().or(z.literal("")).optional().transform(v => v === "" ? undefined : v),
});

const updateIncidentSchema = createIncidentSchema.partial().extend({
  fechaInicio:      z.string().or(z.date()).optional().transform(v => v ? new Date(v) : undefined),
  fechaResolucion:  z.string().or(z.date()).optional().transform(v => v ? new Date(v) : undefined),
  fechaCierre:      z.string().or(z.date()).optional().transform(v => v ? new Date(v) : undefined),
  esRecurrente:     z.boolean().optional(),
});

export class IncidentController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = parsePagination(req);
      const filters = {
        search:       typeof req.query.search === "string" ? req.query.search : undefined,
        estado:       typeof req.query.estado === "string" ? req.query.estado : undefined,
        prioridad:    typeof req.query.prioridad === "string" ? req.query.prioridad : undefined,
        categoria:    typeof req.query.categoria === "string" ? req.query.categoria : undefined,
        asignadoA:    typeof req.query.asignadoA === "string" ? req.query.asignadoA : undefined,
        reportadoPor: typeof req.query.reportadoPor === "string" ? req.query.reportadoPor : undefined,
        desde:        req.query.desde ? new Date(String(req.query.desde)) : undefined,
        hasta:        req.query.hasta ? new Date(String(req.query.hasta)) : undefined,
      };
      const result = await new GetIncidentsUseCase(incidentRepo).findAll(page, limit, filters);
      sendPaginated(res, result.data, result.total, page, limit);
    } catch (err) { next(err); }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const incident = await new GetIncidentsUseCase(incidentRepo).findById(id);
      sendSuccess(res, incident);
    } catch (err) { next(err); }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createIncidentSchema.parse(req.body);
      const incident = await new CreateIncidentUseCase(incidentRepo).execute(input, req.user!.userId);
      sendCreated(res, incident);
    } catch (err) { next(err); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const input = updateIncidentSchema.parse(req.body);
      const incident = await new UpdateIncidentUseCase(incidentRepo).execute(id, input);
      sendSuccess(res, incident);
    } catch (err) { next(err); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await new DeleteIncidentUseCase(incidentRepo).execute(id);
      sendNoContent(res);
    } catch (err) { next(err); }
  }
}
