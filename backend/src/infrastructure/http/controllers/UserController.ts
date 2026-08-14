import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../../../shared/utils/response";
import { parsePagination } from "../../../shared/utils/pagination";
import { PrismaUserRepository } from "../../database/repositories/PrismaUserRepository";
import { CreateUserUseCase } from "../../../use-cases/users/CreateUserUseCase";
import { UpdateUserUseCase } from "../../../use-cases/users/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../../use-cases/users/DeleteUserUseCase";
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
      sendCreated(res, { ...user, passwordHash: undefined });
    } catch (err) { next(err); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const input = updateUserSchema.parse(req.body);
      const user = await new UpdateUserUseCase(userRepo).execute(id, input);
      sendSuccess(res, { ...user, passwordHash: undefined });
    } catch (err) { next(err); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await new DeleteUserUseCase(userRepo).execute(id);
      sendNoContent(res);
    } catch (err) { next(err); }
  }
}
