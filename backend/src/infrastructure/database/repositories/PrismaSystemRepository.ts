import { prisma } from "../prisma/client";
import { ISystemRepository, SystemData, CreateSystemDTO } from "../../../domain/repositories/ISystemRepository";

export class PrismaSystemRepository implements ISystemRepository {
  async findAll(): Promise<SystemData[]> {
    return prisma.system.findMany({
      orderBy: { nombre: "asc" },
    });
  }

  async findById(id: number): Promise<SystemData | null> {
    return prisma.system.findUnique({
      where: { id },
    });
  }

  async findByCodigo(codigo: string): Promise<SystemData | null> {
    return prisma.system.findUnique({
      where: { codigo },
    });
  }

  async create(data: CreateSystemDTO): Promise<SystemData> {
    return prisma.system.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
      },
    });
  }

  async update(id: number, data: Partial<CreateSystemDTO>): Promise<SystemData> {
    return prisma.system.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.system.delete({
      where: { id },
    });
  }
}
