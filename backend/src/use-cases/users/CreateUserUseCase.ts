import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { hashService } from "../../infrastructure/services/HashService";
import { ConflictError } from "../../shared/errors/AppError";
import { CreateUserDTO } from "../../domain/entities/User";

export class CreateUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(data: CreateUserDTO) {
    if (await this.repo.findByEmail(data.email))    throw new ConflictError("El email ya estÃ¡ registrado");
    if (await this.repo.findByUsername(data.username)) throw new ConflictError("El username ya estÃ¡ registrado");
    const passwordHash = await hashService.hash(data.password);
    return this.repo.create({ ...data, passwordHash });
  }
}
