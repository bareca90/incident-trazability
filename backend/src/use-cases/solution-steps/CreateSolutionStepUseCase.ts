import { ISolutionStepRepository } from "../../domain/repositories/ISolutionStepRepository";
import { IIncidentRepository } from "../../domain/repositories/IIncidentRepository";
import { CreateSolutionStepDTO } from "../../domain/entities/SolutionStep";
import { NotFoundError } from "../../shared/errors/AppError";

export class CreateSolutionStepUseCase {
  constructor(
    private stepRepo: ISolutionStepRepository,
    private incidentRepo: IIncidentRepository,
  ) {}

  async execute(incidentId: string, data: CreateSolutionStepDTO | CreateSolutionStepDTO[]) {
    const inc = await this.incidentRepo.findById(incidentId);
    if (!inc) throw new NotFoundError("Incidencia");

    if (Array.isArray(data)) {
      return this.stepRepo.createBatch(incidentId, data);
    }
    return this.stepRepo.create(incidentId, data);
  }
}
