import { IRoleRepository, CreateRoleDTO } from "../../domain/repositories/IRoleRepository";
import { ConflictError } from "../../shared/errors/AppError";

export class CreateRoleUseCase {
  constructor(private repo: IRoleRepository) {}
  async execute(data: CreateRoleDTO) {
    if (await this.repo.findByCodigo(data.codigo)) throw new ConflictError("Código de rol ya existe");
    return this.repo.create(data);
  }
}
