import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendSuccess, sendCreated, sendNoContent } from "../../../shared/utils/response";
import { PrismaSystemRepository } from "../../database/repositories/PrismaSystemRepository";
import { SystemUseCases } from "../../../use-cases/systems/SystemUseCases";

const systemRepo = new PrismaSystemRepository();
const systemUseCases = new SystemUseCases(systemRepo);

const createSystemSchema = z.object({
  codigo:      z.string().min(2).max(80),
  nombre:      z.string().min(2).max(200),
  descripcion: z.string().optional(),
  activo:      z.boolean().optional().default(true),
});

export class SystemController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const systems = await systemUseCases.getAll();
      sendSuccess(res, systems);
    } catch (err) { next(err); }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const system = await systemUseCases.getById(id);
      sendSuccess(res, system);
    } catch (err) { next(err); }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createSystemSchema.parse(req.body);
      const system = await systemUseCases.create(input);
      sendCreated(res, system);
    } catch (err) { next(err); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const input = createSystemSchema.partial().parse(req.body);
      const system = await systemUseCases.update(id, input);
      sendSuccess(res, system);
    } catch (err) { next(err); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      await systemUseCases.delete(id);
      sendNoContent(res);
    } catch (err) { next(err); }
  }
}
