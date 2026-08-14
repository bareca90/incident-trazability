import { CreateIncidentDTO, IncidentEntity, UpdateIncidentDTO } from "../entities/Incident";
import { PaginatedResult } from "../../shared/types";

export interface IncidentFilters {
  search?: string;
  estado?: string;
  prioridad?: string;
  categoria?: string;
  asignadoA?: string;
  reportadoPor?: string;
  desde?: Date;
  hasta?: Date;
}

export interface IIncidentRepository {
  findAll(page: number, limit: number, filters?: IncidentFilters): Promise<PaginatedResult<IncidentEntity>>;
  findById(id: string, includeSteps?: boolean): Promise<IncidentEntity | null>;
  findByNumero(numero: string): Promise<IncidentEntity | null>;
  create(data: CreateIncidentDTO & { reportadoPor: string }): Promise<IncidentEntity>;
  update(id: string, data: UpdateIncidentDTO): Promise<IncidentEntity>;
  softDelete(id: string): Promise<void>;
}
