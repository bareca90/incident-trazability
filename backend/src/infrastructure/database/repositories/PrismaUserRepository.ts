import { prisma } from "../prisma/client";
import { IUserRepository, UserFilters } from "../../../domain/repositories/IUserRepository";
import { CreateUserDTO, UpdateUserDTO, UserEntity } from "../../../domain/entities/User";
import { PaginatedResult } from "../../../shared/types";

export class PrismaUserRepository implements IUserRepository {
  private toEntity(u: any): UserEntity {
    return u as UserEntity;
  }

  async findAll(page: number, limit: number, filters: UserFilters = {}): Promise<PaginatedResult<UserEntity>> {
    const where: any = { deletedAt: null };
    if (filters.estado) where.estado = filters.estado;
    if (filters.search) {
      where.OR = [
        { username: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { nombres: { contains: filters.search, mode: "insensitive" } },
        { apellidos: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.user.count({ where }),
    ]);
    return { data: data.map(this.toEntity), total, page, limit };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const u = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    return u ? this.toEntity(u) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const u = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    return u ? this.toEntity(u) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const u = await prisma.user.findFirst({ where: { username, deletedAt: null } });
    return u ? this.toEntity(u) : null;
  }

  async create(data: CreateUserDTO & { passwordHash: string }): Promise<UserEntity> {
    const u = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono,
        estado: (data.estado as any) ?? "activo",
      },
    });
    return this.toEntity(u);
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserEntity> {
    const u = await prisma.user.update({ where: { id }, data: data as any });
    return this.toEntity(u);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), estado: "inactivo" } });
  }

  async incrementLoginAttempts(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { intentosLogin: { increment: 1 } } });
  }

  async resetLoginAttempts(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { intentosLogin: 0 } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { ultimoLogin: new Date() } });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { passwordHash, mustChangePwd: false } });
  }
}
