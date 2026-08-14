import { CreateSolutionStepDTO, SolutionStepEntity, StepAttachmentEntity } from "../entities/SolutionStep";
import { PaginatedResult } from "../../shared/types";

export interface ISolutionStepRepository {
  findByIncident(incidentId: string): Promise<SolutionStepEntity[]>;
  findById(id: string): Promise<SolutionStepEntity | null>;
  getNextPasoNumber(incidentId: string): Promise<number>;
  create(incidentId: string, data: CreateSolutionStepDTO): Promise<SolutionStepEntity>;
  createBatch(incidentId: string, steps: CreateSolutionStepDTO[]): Promise<SolutionStepEntity[]>;
  update(id: string, data: Partial<CreateSolutionStepDTO>): Promise<SolutionStepEntity>;
  delete(id: string): Promise<void>;
  // Attachments
  findAttachments(stepId: string): Promise<StepAttachmentEntity[]>;
  findAttachmentById(id: string): Promise<StepAttachmentEntity | null>;
  createAttachment(data: Omit<StepAttachmentEntity, "id" | "createdAt">): Promise<StepAttachmentEntity>;
  deleteAttachment(id: string): Promise<void>;
}
