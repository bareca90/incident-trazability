import { prisma } from "../prisma/client";
import { IRoleRepository, RoleData, CreateRoleDTO, PermissionDTO } from "../../../domain/repositories/IRoleRepository";
import { PaginatedResult } from "../../../shared/types";

export class PrismaRoleRepository implements IRoleRepository {
  async findAll(page: number, limit: number): Promise<PaginatedResult<RoleData>> {
    const [data, total] = await Promise.all([
      prisma.role.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { nombre: "asc" } }),
      prisma.role.count(),
    ]);
    return { data: data as RoleData[], total, page, limit };
  }

  async findById(id: number): Promise<RoleData | null> {
    return (await prisma.role.findUnique({ where: { id } })) as RoleData | null;
  }

  async findByCodigo(codigo: string): Promise<RoleData | null> {
    return (await prisma.role.findUnique({ where: { codigo } })) as RoleData | null;
  }

  async create(data: CreateRoleDTO): Promise<RoleData> {
    return (await prisma.role.create({ data: data as any })) as RoleData;
  }

  async update(id: number, data: Partial<CreateRoleDTO> & { activo?: boolean }): Promise<RoleData> {
    return (await prisma.role.update({ where: { id }, data: data as any })) as RoleData;
  }

  async delete(id: number): Promise<void> {
    await prisma.role.delete({ where: { id } });
  }

  async getPermissions(roleId: number): Promise<unknown[]> {
    return prisma.roleOptionAccess.findMany({
      where: { roleId },
      include: { menuOption: { include: { menu: true } } },
    });
  }

  async setPermissions(roleId: number, permissions: PermissionDTO[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.roleOptionAccess.deleteMany({ where: { roleId } });
      if (permissions.length > 0) {
        await tx.roleOptionAccess.createMany({
          data: permissions.map((p) => ({
            roleId,
            menuOptionId: p.menuOptionId,
            acceso: p.acceso as any,
            permitido: p.permitido,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  async findUserRoles(userId: string): Promise<RoleData[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId, activo: true },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role as RoleData);
  }

  async assignRoleToUser(userId: string, roleId: number, assignedBy: string, vigenciaHasta?: Date): Promise<void> {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      create: { userId, roleId, asignadoPor: assignedBy, activo: true, vigenciaHasta },
      update: { activo: true, asignadoPor: assignedBy, vigenciaHasta },
    });
  }

  async removeRoleFromUser(userId: string, roleId: number): Promise<void> {
    await prisma.userRole.updateMany({
      where: { userId, roleId },
      data: { activo: false },
    });
  }
}
