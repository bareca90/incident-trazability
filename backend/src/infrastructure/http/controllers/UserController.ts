import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../../../shared/utils/response";
import { parsePagination } from "../../../shared/utils/pagination";
import { PrismaUserRepository } from "../../database/repositories/PrismaUserRepository";
import { CreateUserUseCase } from "../../../use-cases/users/CreateUserUseCase";
import { UpdateUserUseCase } from "../../../use-cases/users/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../../use-cases/users/DeleteUserUseCase";
import { ResetPasswordUseCase } from "../../../use-cases/users/ResetPasswordUseCase";
import { auditLogService } from "../../services/AuditLogService";
import { prisma } from "../../database/prisma/client";
import { NotFoundError } from "../../../shared/errors/AppError";

const userRepo = new PrismaUserRepository();

const createUserSchema = z.object({
  username:  z.string().min(3).max(80),
  email:     z.string().email(),
  password:  z.string().min(8),
  nombres:   z.string().min(1).max(150),
  apellidos: z.string().min(1).max(150),
  telefono:  z.string().optional(),
  estado:    z.enum(["activo", "inactivo", "bloqueado", "pendiente"]).optional(),
});

const updateUserSchema = createUserSchema.partial().omit({ password: true });

const resetPasswordSchema = z.object({
  newPassword:   z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  mustChangePwd: z.boolean().optional().default(true),
});

const forcePasswordChangeSchema = z.object({
  mustChange: z.boolean().optional().default(true),
});

export class UserController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = parsePagination(req);
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const estado = typeof req.query.estado === "string" ? req.query.estado : undefined;
      const result = await userRepo.findAll(page, limit, { search, estado });
      sendPaginated(res, result.data.map(u => ({ ...u, passwordHash: undefined })), result.total, page, limit);
    } catch (err) { next(err); }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const user = await userRepo.findById(id);
      if (!user) throw new NotFoundError("Usuario");
      sendSuccess(res, { ...user, passwordHash: undefined });
    } catch (err) { next(err); }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createUserSchema.parse(req.body);
      const user = await new CreateUserUseCase(userRepo).execute(input);
      await auditLogService.logFromRequest(req, "CREATE_USER", {
        modulo: "auth", entidad: "users", entidadId: user.id,
        descripcion: `Usuario creado: ${user.username}`,
      });
      sendCreated(res, { ...user, passwordHash: undefined });
    } catch (err) { next(err); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const input = updateUserSchema.parse(req.body);
      const user = await new UpdateUserUseCase(userRepo).execute(id, input);
      await auditLogService.logFromRequest(req, "UPDATE_USER", {
        modulo: "auth", entidad: "users", entidadId: user.id,
        descripcion: `Usuario actualizado: ${user.username}`,
      });
      sendSuccess(res, { ...user, passwordHash: undefined });
    } catch (err) { next(err); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await new DeleteUserUseCase(userRepo).execute(id);
      await auditLogService.logFromRequest(req, "DELETE_USER", {
        modulo: "auth", entidad: "users", entidadId: id,
        descripcion: `Usuario inactivado ID: ${id}`,
      });
      sendNoContent(res);
    } catch (err) { next(err); }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { newPassword, mustChangePwd } = resetPasswordSchema.parse(req.body);
      await new ResetPasswordUseCase(userRepo).execute(id, newPassword, mustChangePwd);
      await auditLogService.logFromRequest(req, "RESET_PASSWORD", {
        modulo: "auth", entidad: "users", entidadId: id,
        descripcion: `Contraseña reseteada por administrador (debe cambiar: ${mustChangePwd})`,
      });
      sendSuccess(res, null, "Contraseña reseteada exitosamente");
    } catch (err) { next(err); }
  }

  async forcePasswordChange(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { mustChange } = forcePasswordChangeSchema.parse(req.body);
      await userRepo.forcePasswordChange(id, mustChange);
      await auditLogService.logFromRequest(req, "FORCE_PASSWORD_CHANGE", {
        modulo: "auth", entidad: "users", entidadId: id,
        descripcion: mustChange ? "Se forzó cambio de contraseña para el próximo inicio" : "Se desmarcó cambio forzoso de contraseña",
      });
      sendSuccess(res, null, mustChange ? "Cambio de contraseña exigido" : "Cambio de contraseña desmarcado");
    } catch (err) { next(err); }
  }

  async unlock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await userRepo.unlockUser(id);
      await auditLogService.logFromRequest(req, "UNLOCK_USER", {
        modulo: "auth", entidad: "users", entidadId: id,
        descripcion: "Cuenta de usuario desbloqueada e intentos reiniciados a cero",
      });
      sendSuccess(res, null, "Usuario desbloqueado exitosamente");
    } catch (err) { next(err); }
  }

  async getPasswordLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = parsePagination(req);
      const where: any = {
        OR: [
          { modulo: "auth" },
          { accion: { in: ["CHANGE_PASSWORD", "RESET_PASSWORD", "FORCE_PASSWORD_CHANGE", "UNLOCK_USER", "LOGIN"] } },
        ],
      };

      const [data, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, username: true, email: true, nombres: true, apellidos: true } } },
        }),
        prisma.auditLog.count({ where }),
      ]);

      sendPaginated(res, data, total, page, limit);
    } catch (err) { next(err); }
  }
}

