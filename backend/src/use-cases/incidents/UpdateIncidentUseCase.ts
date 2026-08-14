import { IIncidentRepository } from "../../domain/repositories/IIncidentRepository";
import { UpdateIncidentDTO } from "../../domain/entities/Incident";
import { NotFoundError } from "../../shared/errors/AppError";

export class UpdateIncidentUseCase {
  constructor(private repo: IIncidentRepository) {}

  async execute(id: string, data: UpdateIncidentDTO) {
    const inc = await this.repo.findById(id);
    if (!inc) throw new NotFoundError("Incidencia");
    return this.repo.update(id, data);
  }
}
