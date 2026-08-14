export type EstadoUsuario = "activo" | "inactivo" | "bloqueado" | "pendiente";

export interface UserEntity {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  avatarUrl?: string | null;
  estado: EstadoUsuario;
  intentosLogin: number;
  ultimoLogin?: Date | null;
  mustChangePwd: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  estado?: EstadoUsuario;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  avatarUrl?: string;
  estado?: EstadoUsuario;
}
