import { prisma } from "../prisma/client";
import { IMenuRepository, MenuData, MenuOptionData } from "../../../domain/repositories/IMenuRepository";

export class PrismaMenuRepository implements IMenuRepository {
  async findAllMenus(): Promise<MenuData[]> {
    return prisma.menu.findMany({ orderBy: { orden: "asc" } }) as any;
  }

  async findMenuById(id: number): Promise<MenuData | null> {
    return prisma.menu.findUnique({ where: { id } }) as any;
  }

  async createMenu(data: Omit<MenuData, "id" | "createdAt" | "updatedAt">): Promise<MenuData> {
    return prisma.menu.create({ data: data as any }) as any;
  }

  async updateMenu(id: number, data: Partial<Omit<MenuData, "id" | "createdAt" | "updatedAt">>): Promise<MenuData> {
    return prisma.menu.update({ where: { id }, data: data as any }) as any;
  }

  async deleteMenu(id: number): Promise<void> {
    await prisma.menu.delete({ where: { id } });
  }

  async findMenuOptions(menuId: number): Promise<MenuOptionData[]> {
    return prisma.menuOption.findMany({ where: { menuId }, orderBy: { orden: "asc" } }) as any;
  }

  async findMenuOptionById(id: number): Promise<MenuOptionData | null> {
    return prisma.menuOption.findUnique({ where: { id } }) as any;
  }

  async createMenuOption(data: Omit<MenuOptionData, "id" | "createdAt" | "updatedAt">): Promise<MenuOptionData> {
    return prisma.menuOption.create({ data: data as any }) as any;
  }

  async updateMenuOption(id: number, data: Partial<Omit<MenuOptionData, "id" | "menuId" | "createdAt" | "updatedAt">>): Promise<MenuOptionData> {
    return prisma.menuOption.update({ where: { id }, data: data as any }) as any;
  }

  async deleteMenuOption(id: number): Promise<void> {
    await prisma.menuOption.delete({ where: { id } });
  }

  async findAllOptions(): Promise<MenuOptionData[]> {
    return prisma.menuOption.findMany({ include: { menu: true }, orderBy: { orden: "asc" } }) as any;
  }
}
