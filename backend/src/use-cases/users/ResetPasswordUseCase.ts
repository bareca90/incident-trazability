import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { hashService } from "../../infrastructure/services/HashService";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";

export class ResetPasswordUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(userId: string, newPassword: string, mustChangePwd: boolean = true): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundError("Usuario");

    if (newPassword.length < 8) {
      throw new ValidationError("La contraseña temporal debe tener al menos 8 caracteres");
    }

    const newHash = await hashService.hash(newPassword);
    await this.repo.resetPassword(userId, newHash, mustChangePwd);
    await this.repo.addPasswordHistory(userId, newHash, "reseteo_administrativo");
  }
}
