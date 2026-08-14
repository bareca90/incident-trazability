import { IRoleRepository, PermissionDTO } from "../../domain/repositories/IRoleRepository";
import { NotFoundError } from "../../shared/errors/AppError";

export class SetPermissionsUseCase {
  constructor(private repo: IRoleRepository) {}
  async execute(roleId: number, permissions: PermissionDTO[]): Promise<void> {
    if (!await this.repo.findById(roleId)) throw new NotFoundError("Rol");
    await this.repo.setPermissions(roleId, permissions);
  }
}
