import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendSuccess, sendCreated, sendNoContent } from "../../../shared/utils/response";
import { PrismaSolutionStepRepository } from "../../database/repositories/PrismaSolutionStepRepository";
import { PrismaIncidentRepository } from "../../database/repositories/PrismaIncidentRepository";
import { CreateSolutionStepUseCase } from "../../../use-cases/solution-steps/CreateSolutionStepUseCase";
import { UpdateSolutionStepUseCase } from "../../../use-cases/solution-steps/UpdateSolutionStepUseCase";
import { UploadAttachmentUseCase } from "../../../use-cases/solution-steps/UploadAttachmentUseCase";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError";

const stepRepo = new PrismaSolutionStepRepository();
const incidentRepo = new PrismaIncidentRepository();

const singleStepSchema = z.object({
  tipo:              z.enum(["consulta_sql", "comando", "nota", "archivo", "configuracion", "diagnostico", "rollback", "otro"]).default("nota"),
  titulo:            z.string().min(2).max(300),
  descripcion:       z.string().optional(),
  contenido:         z.string().optional(),
  ambiente:          z.string().optional(),
  servidor:          z.string().optional(),
  baseDatos:         z.string().optional(),
  usuarioDb:         z.string().optional(),
  resultado:         z.string().optional(),
  exitoso:           z.boolean().optional(),
  tiempoEjecucionMs: z.union([z.number().int(), z.string().transform(v => v ? parseInt(v) : undefined)]).optional(),
  esRollback:        z.boolean().optional().default(false),
  ejecutadoPor:      z.string().uuid().or(z.literal("")).optional().transform(v => v === "" ? undefined : v),
  notasInternas:     z.string().optional(),
  metadata:          z.record(z.unknown()).optional(),
  fechaEjecucion:    z.string().or(z.date()).optional().transform(v => v ? new Date(v) : undefined),
});

const createStepsSchema = z.union([singleStepSchema, z.array(singleStepSchema)]);

export class SolutionStepController {
  async getByIncident(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const incidentId = String(req.params.incidentId);
      const steps = await stepRepo.findByIncident(incidentId);
      sendSuccess(res, steps);
    } catch (err) { next(err); }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const step = await stepRepo.findById(id);
      if (!step) throw new NotFoundError("Paso de solución");
      sendSuccess(res, step);
    } catch (err) { next(err); }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const incidentId = String(req.params.incidentId);
      const input = createStepsSchema.parse(req.body);
      const created = await new CreateSolutionStepUseCase(stepRepo, incidentRepo).execute(
        incidentId, input as any
      );
      sendCreated(res, created);
    } catch (err) { next(err); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const input = singleStepSchema.partial().parse(req.body);
      const step = await new UpdateSolutionStepUseCase(stepRepo).execute(id, input as any);
      sendSuccess(res, step);
    } catch (err) { next(err); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await stepRepo.delete(id);
      sendNoContent(res);
    } catch (err) { next(err); }
  }

  async uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!req.file) throw new ValidationError("Archivo es requerido");
      const descripcion = req.body.descripcion as string;
      const attachment = await new UploadAttachmentUseCase(stepRepo).execute(
        id, req.file, req.user!.userId, descripcion
      );
      sendCreated(res, attachment, "Archivo subido correctamente");
    } catch (err) { next(err); }
  }

  async deleteAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentId = String(req.params.attachmentId);
      await stepRepo.deleteAttachment(attachmentId);
      sendNoContent(res);
    } catch (err) { next(err); }
  }
}
