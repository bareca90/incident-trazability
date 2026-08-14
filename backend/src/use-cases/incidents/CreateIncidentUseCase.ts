import { IIncidentRepository } from "../../domain/repositories/IIncidentRepository";
import { CreateIncidentDTO } from "../../domain/entities/Incident";

export class CreateIncidentUseCase {
  constructor(private repo: IIncidentRepository) {}

  async execute(data: CreateIncidentDTO, userId: string) {
    return this.repo.create({ ...data, reportadoPor: userId });
  }
}
