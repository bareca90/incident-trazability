import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { NotFoundError } from "../../shared/errors/AppError";

export class DeleteUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError("Usuario");
    await this.repo.softDelete(id);
  }
}
