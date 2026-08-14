import { IIncidentRepository, IncidentFilters } from "../../domain/repositories/IIncidentRepository";
import { NotFoundError } from "../../shared/errors/AppError";

export class GetIncidentsUseCase {
  constructor(private repo: IIncidentRepository) {}

  async findAll(page: number, limit: number, filters?: IncidentFilters) {
    return this.repo.findAll(page, limit, filters);
  }

  async findById(id: string) {
    const inc = await this.repo.findById(id, true);
    if (!inc) throw new NotFoundError("Incidencia");
    return inc;
  }
}
