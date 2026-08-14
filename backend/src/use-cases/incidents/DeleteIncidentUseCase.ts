import { IIncidentRepository } from "../../domain/repositories/IIncidentRepository";
import { NotFoundError } from "../../shared/errors/AppError";

export class DeleteIncidentUseCase {
  constructor(private repo: IIncidentRepository) {}

  async execute(id: string): Promise<void> {
    const inc = await this.repo.findById(id);
    if (!inc) throw new NotFoundError("Incidencia");
    await this.repo.softDelete(id);
  }
}
