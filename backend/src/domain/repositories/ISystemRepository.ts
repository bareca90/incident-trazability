export interface SystemData {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSystemDTO {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ISystemRepository {
  findAll(): Promise<SystemData[]>;
  findById(id: number): Promise<SystemData | null>;
  findByCodigo(codigo: string): Promise<SystemData | null>;
  create(data: CreateSystemDTO): Promise<SystemData>;
  update(id: number, data: Partial<CreateSystemDTO>): Promise<SystemData>;
  delete(id: number): Promise<void>;
}
