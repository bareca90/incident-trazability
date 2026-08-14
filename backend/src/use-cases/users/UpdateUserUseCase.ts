import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { NotFoundError, ConflictError } from "../../shared/errors/AppError";
import { UpdateUserDTO } from "../../domain/entities/User";

export class UpdateUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: string, data: UpdateUserDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Usuario");
    if (data.email && data.email !== existing.email) {
      if (await this.repo.findByEmail(data.email)) throw new ConflictError("Email ya en uso");
    }
    return this.repo.update(id, data);
  }
}
