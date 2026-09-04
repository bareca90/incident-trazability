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
  forcePasswordChange(id: string, mustChange: boolean): Promise<void>;
  unlockUser(id: string): Promise<void>;
  resetPassword(id: string, passwordHash: string, mustChangePwd?: boolean): Promise<void>;
  addPasswordHistory(userId: string, passwordHash: string, motivo?: string): Promise<void>;
  getRecentPasswordHashes(userId: string, limit?: number): Promise<string[]>;
}

