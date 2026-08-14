import { PaginatedResult } from "../../shared/types";

export interface RoleData {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  esAdmin: boolean;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDTO {
  codigo: string;
  nombre: string;
  descripcion?: string;
  esAdmin?: boolean;
}

export interface PermissionDTO {
  menuOptionId: number;
  acceso: string;
  permitido: boolean;
}

export interface IRoleRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<RoleData>>;
  findById(id: number): Promise<RoleData | null>;
  findByCodigo(codigo: string): Promise<RoleData | null>;
  create(data: CreateRoleDTO): Promise<RoleData>;
  update(id: number, data: Partial<CreateRoleDTO> & { activo?: boolean }): Promise<RoleData>;
  delete(id: number): Promise<void>;
  getPermissions(roleId: number): Promise<unknown[]>;
  setPermissions(roleId: number, permissions: PermissionDTO[]): Promise<void>;
  findUserRoles(userId: string): Promise<RoleData[]>;
  assignRoleToUser(userId: string, roleId: number, assignedBy: string, vigenciaHasta?: Date): Promise<void>;
  removeRoleFromUser(userId: string, roleId: number): Promise<void>;
}
