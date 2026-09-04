import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { hashService } from "../../infrastructure/services/HashService";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors/AppError";

export class ChangePasswordUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundError("Usuario");

    // Verificar contraseÃ±a actual
    const valid = await hashService.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError("La contraseña actual es incorrecta");

    // Verificar que la nueva contraseÃ±a no sea igual a la actual
    if (currentPassword === newPassword) {
      throw new ValidationError("La nueva contraseña no puede ser idéntica a la contraseña actual");
    }

    // Validar complejidad de la contraseÃ±a
    if (newPassword.length < 8) {
      throw new ValidationError("La contraseña debe tener al menos 8 caracteres");
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new ValidationError("La contraseña debe incluir al menos una letra mayúscula (A-Z)");
    }
    if (!/[a-z]/.test(newPassword)) {
      throw new ValidationError("La contraseña debe incluir al menos una letra minúscula (a-z)");
    }
    if (!/[0-9]/.test(newPassword)) {
      throw new ValidationError("La contraseña debe incluir al menos un número (0-9)");
    }
    if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(newPassword)) {
      throw new ValidationError("La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)");
    }

    // Validar contra las últimas 5 contraseñas históricas
    const recentHashes = await this.repo.getRecentPasswordHashes(userId, 5);
    for (const oldHash of recentHashes) {
      const match = await hashService.compare(newPassword, oldHash);
      if (match) {
        throw new ValidationError("Por seguridad, no puede reutilizar una de sus últimas 5 contraseñas");
      }
    }

    const newHash = await hashService.hash(newPassword);
    await this.repo.updatePassword(userId, newHash);
    await this.repo.addPasswordHistory(userId, newHash, "cambio_voluntario");
  }
}

