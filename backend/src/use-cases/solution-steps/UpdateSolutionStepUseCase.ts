import { ISolutionStepRepository } from "../../domain/repositories/ISolutionStepRepository";
import { CreateSolutionStepDTO } from "../../domain/entities/SolutionStep";
import { NotFoundError } from "../../shared/errors/AppError";

export class UpdateSolutionStepUseCase {
  constructor(private repo: ISolutionStepRepository) {}

  async execute(id: string, data: Partial<CreateSolutionStepDTO>) {
    const step = await this.repo.findById(id);
    if (!step) throw new NotFoundError("Paso");
    return this.repo.update(id, data);
  }
}
