import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendSuccess } from "../../../shared/utils/response";
import { LoginUseCase } from "../../../use-cases/auth/LoginUseCase";
import { RefreshTokenUseCase } from "../../../use-cases/auth/RefreshTokenUseCase";
import { ChangePasswordUseCase } from "../../../use-cases/users/ChangePasswordUseCase";
import { PrismaUserRepository } from "../../database/repositories/PrismaUserRepository";
import { PrismaRoleRepository } from "../../database/repositories/PrismaRoleRepository";
import { auditLogService } from "../../services/AuditLogService";
import { UnauthorizedError } from "../../../shared/errors/AppError";

import { PrismaMenuRepository } from "../../database/repositories/PrismaMenuRepository";

const userRepo = new PrismaUserRepository();
const roleRepo = new PrismaRoleRepository();
const menuRepo = new PrismaMenuRepository();

const loginSchema = z.object({
  email:    z.string().email("Email invÃ¡lido"),
  password: z.string().min(1, "ContraseÃ±a requerida"),
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

const changePwdSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8, "MÃ­nimo 8 caracteres"),
});

export class AuthController {
  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input  = loginSchema.parse(req.body);
      const result = await new LoginUseCase(userRepo, roleRepo).execute(input);
      await auditLogService.logFromRequest(req, "LOGIN", {
        modulo: "auth", entidad: "users", entidadId: result.user.id as string,
        descripcion: `Login exitoso para ${input.email}`,
      });
      sendSuccess(res, result, "Login exitoso");
    } catch (err) { next(err); }
  }

  async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const tokens = await new RefreshTokenUseCase(userRepo, roleRepo).execute(refreshToken);
      sendSuccess(res, tokens, "Token renovado");
    } catch (err) { next(err); }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await auditLogService.logFromRequest(req, "LOGOUT", { modulo: "auth" });
      sendSuccess(res, null, "SesiÃ³n cerrada");
    } catch (err) { next(err); }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userRepo.findById(req.user!.userId);
      const roles = await roleRepo.findUserRoles(req.user!.userId);
      const isAdmin = roles.some((r) => r.esAdmin);
      const permissions = await menuRepo.findUserPermissions(req.user!.userId, isAdmin);
      sendSuccess(res, { ...user, passwordHash: undefined, roles, isAdmin, permissions });
    } catch (err) { next(err); }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = changePwdSchema.parse(req.body);
      await new ChangePasswordUseCase(userRepo).execute(req.user!.userId, currentPassword, newPassword);
      await auditLogService.logFromRequest(req, "CHANGE_PASSWORD", { modulo: "auth" });
      sendSuccess(res, null, "ContraseÃ±a actualizada");
    } catch (err) { next(err); }
  }
}
