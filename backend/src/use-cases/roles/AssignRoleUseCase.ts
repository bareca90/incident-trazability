import { IRoleRepository } from "../../domain/repositories/IRoleRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { NotFoundError } from "../../shared/errors/AppError";

export class AssignRoleUseCase {
  constructor(private userRepo: IUserRepository, private roleRepo: IRoleRepository) {}

  async assign(userId: string, roleId: number, assignedBy: string, vigenciaHasta?: Date): Promise<void> {
    if (!await this.userRepo.findById(userId)) throw new NotFoundError("Usuario");
    if (!await this.roleRepo.findById(roleId)) throw new NotFoundError("Rol");
    await this.roleRepo.assignRoleToUser(userId, roleId, assignedBy, vigenciaHasta);
  }

  async remove(userId: string, roleId: number): Promise<void> {
    await this.roleRepo.removeRoleFromUser(userId, roleId);
  }
}
