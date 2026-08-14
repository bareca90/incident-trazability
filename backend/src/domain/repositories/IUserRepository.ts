import { CreateUserDTO, UpdateUserDTO, UserEntity } from "../entities/User";
import { PaginatedResult } from "../../shared/types";

export interface UserFilters {
  search?: string;
  estado?: string;
}

export interface IUserRepository {
  findAll(page: number, limit: number, filters?: UserFilters): Promise<PaginatedResult<UserEntity>>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  create(data: CreateUserDTO & { passwordHash: string }): Promise<UserEntity>;
  update(id: string, data: UpdateUserDTO): Promise<UserEntity>;
  softDelete(id: string): Promise<void>;
  incrementLoginAttempts(id: string): Promise<void>;
  resetLoginAttempts(id: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}
