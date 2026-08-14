import { prisma } from "../prisma/client";
import { ISolutionStepRepository } from "../../../domain/repositories/ISolutionStepRepository";
import { CreateSolutionStepDTO, SolutionStepEntity, StepAttachmentEntity } from "../../../domain/entities/SolutionStep";

export class PrismaSolutionStepRepository implements ISolutionStepRepository {
  async findByIncident(incidentId: string): Promise<SolutionStepEntity[]> {
    return prisma.solutionStep.findMany({
      where: { incidentId },
      orderBy: { numeroPaso: "asc" },
      include: { attachments: true, executedBy: { select: { id: true, username: true } }, reviewedBy: { select: { id: true, username: true } } },
    }) as any;
  }

  async findById(id: string): Promise<SolutionStepEntity | null> {
    return prisma.solutionStep.findUnique({
      where: { id },
      include: { attachments: true, executedBy: { select: { id: true, username: true } }, reviewedBy: { select: { id: true, username: true } } },
    }) as any;
  }

  async getNextPasoNumber(incidentId: string): Promise<number> {
    const last = await prisma.solutionStep.findFirst({
      where: { incidentId }, orderBy: { numeroPaso: "desc" }, select: { numeroPaso: true },
    });
    return (last?.numeroPaso ?? 0) + 1;
  }

  async create(incidentId: string, data: CreateSolutionStepDTO): Promise<SolutionStepEntity> {
    const numeroPaso = await this.getNextPasoNumber(incidentId);
    return prisma.solutionStep.create({
      data: { ...data as any, incidentId, numeroPaso },
      include: { attachments: true },
    }) as any;
  }

  async createBatch(incidentId: string, steps: CreateSolutionStepDTO[]): Promise<SolutionStepEntity[]> {
    const startNum = await this.getNextPasoNumber(incidentId);
    const created: SolutionStepEntity[] = [];
    for (let i = 0; i < steps.length; i++) {
      const step = await prisma.solutionStep.create({
        data: { ...steps[i] as any, incidentId, numeroPaso: startNum + i },
        include: { attachments: true },
      });
      created.push(step as any);
    }
    return created;
  }

  async update(id: string, data: Partial<CreateSolutionStepDTO>): Promise<SolutionStepEntity> {
    return prisma.solutionStep.update({
      where: { id }, data: { ...data as any, version: { increment: 1 } },
      include: { attachments: true },
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.solutionStep.delete({ where: { id } });
  }

  async findAttachments(stepId: string): Promise<StepAttachmentEntity[]> {
    return prisma.stepAttachment.findMany({ where: { stepId } }) as any;
  }

  async findAttachmentById(id: string): Promise<StepAttachmentEntity | null> {
    return prisma.stepAttachment.findUnique({ where: { id } }) as any;
  }

  async createAttachment(data: Omit<StepAttachmentEntity, "id" | "createdAt">): Promise<StepAttachmentEntity> {
    return prisma.stepAttachment.create({ data: data as any }) as any;
  }

  async deleteAttachment(id: string): Promise<void> {
    await prisma.stepAttachment.delete({ where: { id } });
  }
}
