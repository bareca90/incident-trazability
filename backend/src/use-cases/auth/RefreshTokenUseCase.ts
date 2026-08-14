import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRoleRepository } from "../../domain/repositories/IRoleRepository";
import { jwtService } from "../../infrastructure/services/JwtService";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { v4 as uuidv4 } from "uuid";

export class RefreshTokenUseCase {
  constructor(private userRepo: IUserRepository, private roleRepo: IRoleRepository) {}

  async execute(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId } = jwtService.verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findById(userId);
    if (!user || user.deletedAt || user.estado !== "activo") throw new UnauthorizedError("Usuario no disponible");

    const roles      = await this.roleRepo.findUserRoles(userId);
    const isAdmin    = roles.some((r) => r.esAdmin);
    const sessionId  = uuidv4();

    return {
      accessToken:  jwtService.generateAccessToken({ userId: user.id, username: user.username, email: user.email, roles: roles.map((r) => r.codigo), isAdmin, sessionId }),
      refreshToken: jwtService.generateRefreshToken({ userId: user.id, sessionId }),
    };
  }
}
