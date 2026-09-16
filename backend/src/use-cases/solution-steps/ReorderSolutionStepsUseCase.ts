import { ISolutionStepRepository } from "../../domain/repositories/ISolutionStepRepository";
import { IIncidentRepository } from "../../domain/repositories/IIncidentRepository";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";

export class ReorderSolutionStepsUseCase {
  constructor(
    private stepRepo: ISolutionStepRepository,
    private incidentRepo: IIncidentRepository,
  ) {}

  async execute(incidentId: string, orderedStepIds: string[]) {
    const inc = await this.incidentRepo.findById(incidentId);
    if (!inc) throw new NotFoundError("Incidencia");

    if (!Array.isArray(orderedStepIds) || orderedStepIds.length === 0) {
      throw new ValidationError("La lista de IDs de pasos es requerida");
    }

    return this.stepRepo.reorderSteps(incidentId, orderedStepIds);
  }
}
