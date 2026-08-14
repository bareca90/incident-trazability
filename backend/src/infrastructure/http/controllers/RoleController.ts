import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../../../shared/utils/response";
import { parsePagination } from "../../../shared/utils/pagination";
import { PrismaRoleRepository } from "../../database/repositories/PrismaRoleRepository";
import { PrismaUserRepository } from "../../database/repositories/PrismaUserRepository";
import { CreateRoleUseCase } from "../../../use-cases/roles/CreateRoleUseCase";
import { AssignRoleUseCase } from "../../../use-cases/roles/AssignRoleUseCase";
import { SetPermissionsUseCase } from "../../../use-cases/roles/SetPermissionsUseCase";
import { NotFoundError } from "../../../shared/errors/AppError";

const roleRepo = new PrismaRoleRepository();
const userRepo = new PrismaUserRepository();

const createRoleSchema = z.object({
  codigo:      z.string().min(2).max(80),
  nombre:      z.string().min(2).max(150),
  descripcion: z.string().optional(),
  esAdmin:     z.boolean().optional(),
});

const assignRoleSchema = z.object({
  roleId:        z.number().int().positive(),
  vigenciaHasta: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

const permissionsSchema = z.array(z.object({
  menuOptionId: z.number().int().positive(),
  acceso:       z.enum(["ver", "crear", "editar", "eliminar", "exportar", "aprobar"]),
  permitido:    z.boolean(),
}));

export class RoleController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = parsePagination(req);
      const result = await roleRepo.findAll(page, limit);
      sendPaginated(res, result.data, result.total, page, limit);
    } catch (err) { next(err); }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const role = await roleRepo.findById(id);
      if (!role) throw new NotFoundError("Rol");
      sendSuccess(res, role);
    } catch (err) { next(err); }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createRoleSchema.parse(req.body);
      const role = await new CreateRoleUseCase(roleRepo).execute(input);
      sendCreated(res, role);
    } catch (err) { next(err); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const input = createRoleSchema.partial().parse(req.body);
      const role = await roleRepo.update(id, input);
      sendSuccess(res, role);
    } catch (err) { next(err); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      await roleRepo.delete(id);
      sendNoContent(res);
    } catch (err) { next(err); }
  }

  async getPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const permissions = await roleRepo.getPermissions(id);
      sendSuccess(res, permissions);
    } catch (err) { next(err); }
  }

  async setPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const permissions = permissionsSchema.parse(req.body);
      await new SetPermissionsUseCase(roleRepo).execute(id, permissions);
      sendSuccess(res, null, "Permisos actualizados correctamente");
    } catch (err) { next(err); }
  }

  async getUserRoles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const roles = await roleRepo.findUserRoles(userId);
      sendSuccess(res, roles);
    } catch (err) { next(err); }
  }

  async assignRoleToUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const { roleId, vigenciaHasta } = assignRoleSchema.parse(req.body);
      await new AssignRoleUseCase(userRepo, roleRepo).assign(
        userId, roleId, req.user!.userId, vigenciaHasta
      );
      sendSuccess(res, null, "Rol asignado exitosamente");
    } catch (err) { next(err); }
  }

  async removeRoleFromUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const roleId = parseInt(String(req.params.roleId), 10);
      await new AssignRoleUseCase(userRepo, roleRepo).remove(userId, roleId);
      sendNoContent(res);
    } catch (err) { next(err); }
  }
}
