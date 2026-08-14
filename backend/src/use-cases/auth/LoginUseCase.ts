import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRoleRepository } from "../../domain/repositories/IRoleRepository";
import { hashService } from "../../infrastructure/services/HashService";
import { jwtService } from "../../infrastructure/services/JwtService";
import { UnauthorizedError, ForbiddenError } from "../../shared/errors/AppError";
import { v4 as uuidv4 } from "uuid";

const MAX_ATTEMPTS = 5;

export interface LoginInput { email: string; password: string; }
export interface LoginOutput { accessToken: string; refreshToken: string; user: Record<string, unknown>; }

export class LoginUseCase {
  constructor(
    private userRepo: IUserRepository,
    private roleRepo: IRoleRepository,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || user.deletedAt) throw new UnauthorizedError("Credenciales incorrectas");

    if (user.intentosLogin >= MAX_ATTEMPTS) {
      throw new ForbiddenError("Cuenta bloqueada por exceso de intentos. Contacte al administrador.");
    }

    const valid = await hashService.compare(input.password, user.passwordHash);
    if (!valid) {
      await this.userRepo.incrementLoginAttempts(user.id);
      throw new UnauthorizedError("Credenciales incorrectas");
    }

    if (user.estado === "inactivo" || user.estado === "bloqueado") {
      throw new ForbiddenError(`Cuenta ${user.estado}. Contacte al administrador.`);
    }

    await this.userRepo.resetLoginAttempts(user.id);
    await this.userRepo.updateLastLogin(user.id);

    const roles    = await this.roleRepo.findUserRoles(user.id);
    const isAdmin  = roles.some((r) => r.esAdmin);
    const roleCodigos = roles.map((r) => r.codigo);
    const sessionId   = uuidv4();

    const accessToken  = jwtService.generateAccessToken({ userId: user.id, username: user.username, email: user.email, roles: roleCodigos, isAdmin, sessionId });
    const refreshToken = jwtService.generateRefreshToken({ userId: user.id, sessionId });

    return {
      accessToken, refreshToken,
      user: {
        id: user.id, username: user.username, email: user.email,
        nombres: user.nombres, apellidos: user.apellidos,
        mustChangePwd: user.mustChangePwd, roles: roleCodigos, isAdmin,
      },
    };
  }
}
