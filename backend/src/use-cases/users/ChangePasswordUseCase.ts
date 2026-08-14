import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { hashService } from "../../infrastructure/services/HashService";
import { NotFoundError, UnauthorizedError } from "../../shared/errors/AppError";

export class ChangePasswordUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundError("Usuario");
    const valid = await hashService.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Contraseña actual incorrecta");
    const newHash = await hashService.hash(newPassword);
    await this.repo.updatePassword(userId, newHash);
  }
}
