import { ISystemRepository, CreateSystemDTO } from "../../domain/repositories/ISystemRepository";
import { NotFoundError, ConflictError } from "../../shared/errors/AppError";

export class SystemUseCases {
  constructor(private repo: ISystemRepository) {}

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: number) {
    const sys = await this.repo.findById(id);
    if (!sys) throw new NotFoundError("Sistema");
    return sys;
  }

  async create(data: CreateSystemDTO) {
    const existing = await this.repo.findByCodigo(data.codigo);
    if (existing) throw new ConflictError("Ya existe un sistema con ese código");
    return this.repo.create(data);
  }

  async update(id: number, data: Partial<CreateSystemDTO>) {
    const sys = await this.repo.findById(id);
    if (!sys) throw new NotFoundError("Sistema");
    if (data.codigo && data.codigo !== sys.codigo) {
      const existing = await this.repo.findByCodigo(data.codigo);
      if (existing) throw new ConflictError("Ya existe un sistema con ese código");
    }
    return this.repo.update(id, data);
  }

  async delete(id: number) {
    const sys = await this.repo.findById(id);
    if (!sys) throw new NotFoundError("Sistema");
    await this.repo.delete(id);
  }
}
