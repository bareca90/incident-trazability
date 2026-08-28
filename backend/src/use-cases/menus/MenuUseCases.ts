import { IMenuRepository, MenuData, MenuOptionData } from "../../domain/repositories/IMenuRepository";
import { NotFoundError, ConflictError } from "../../shared/errors/AppError";

export class MenuUseCases {
  constructor(private repo: IMenuRepository) {}

  async getAllMenus() { return this.repo.findAllMenus(); }

  async createMenu(data: Omit<MenuData, "id" | "createdAt" | "updatedAt">) {
    return this.repo.createMenu(data);
  }

  async updateMenu(id: number, data: Partial<Omit<MenuData, "id" | "createdAt" | "updatedAt">>) {
    if (!await this.repo.findMenuById(id)) throw new NotFoundError("Menú");
    return this.repo.updateMenu(id, data);
  }

  async deleteMenu(id: number) {
    if (!await this.repo.findMenuById(id)) throw new NotFoundError("Menú");
    await this.repo.deleteMenu(id);
  }

  async getMenuOptions(menuId: number) { return this.repo.findMenuOptions(menuId); }
  async getAllOptions()                 { return this.repo.findAllOptions(); }

  async createMenuOption(data: Omit<MenuOptionData, "id" | "createdAt" | "updatedAt">) {
    if (!await this.repo.findMenuById(data.menuId)) throw new NotFoundError("Menú padre");
    return this.repo.createMenuOption(data);
  }

  async updateMenuOption(id: number, data: Partial<Omit<MenuOptionData, "id" | "menuId" | "createdAt" | "updatedAt">>) {
    if (!await this.repo.findMenuOptionById(id)) throw new NotFoundError("Opción de menú");
    return this.repo.updateMenuOption(id, data);
  }

  async deleteMenuOption(id: number) {
    if (!await this.repo.findMenuOptionById(id)) throw new NotFoundError("Opción de menú");
    await this.repo.deleteMenuOption(id);
  }

  async getUserMenus(userId: string, isAdmin: boolean) {
    return this.repo.findUserMenus(userId, isAdmin);
  }

  async getUserPermissions(userId: string, isAdmin: boolean) {
    return this.repo.findUserPermissions(userId, isAdmin);
  }
}
