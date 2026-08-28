import { prisma } from "../prisma/client";
import { IMenuRepository, MenuData, MenuOptionData } from "../../../domain/repositories/IMenuRepository";

export class PrismaMenuRepository implements IMenuRepository {
  async findAllMenus(): Promise<MenuData[]> {
    return prisma.menu.findMany({
      include: {
        options: {
          orderBy: { orden: "asc" },
        },
      },
      orderBy: { orden: "asc" },
    }) as any;
  }

  async findMenuById(id: number): Promise<MenuData | null> {
    return prisma.menu.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { orden: "asc" },
        },
      },
    }) as any;
  }

  async createMenu(data: Omit<MenuData, "id" | "createdAt" | "updatedAt" | "options">): Promise<MenuData> {
    return prisma.menu.create({ data: data as any }) as any;
  }

  async updateMenu(id: number, data: Partial<Omit<MenuData, "id" | "createdAt" | "updatedAt" | "options">>): Promise<MenuData> {
    return prisma.menu.update({ where: { id }, data: data as any }) as any;
  }

  async deleteMenu(id: number): Promise<void> {
    await prisma.menu.delete({ where: { id } });
  }

  async findMenuOptions(menuId: number): Promise<MenuOptionData[]> {
    return prisma.menuOption.findMany({ where: { menuId }, include: { menu: true }, orderBy: { orden: "asc" } }) as any;
  }

  async findMenuOptionById(id: number): Promise<MenuOptionData | null> {
    return prisma.menuOption.findUnique({ where: { id }, include: { menu: true } }) as any;
  }

  async createMenuOption(data: Omit<MenuOptionData, "id" | "createdAt" | "updatedAt" | "menu">): Promise<MenuOptionData> {
    return prisma.menuOption.create({ data: data as any, include: { menu: true } }) as any;
  }

  async updateMenuOption(id: number, data: Partial<Omit<MenuOptionData, "id" | "menuId" | "createdAt" | "updatedAt" | "menu">>): Promise<MenuOptionData> {
    return prisma.menuOption.update({ where: { id }, data: data as any, include: { menu: true } }) as any;
  }

  async deleteMenuOption(id: number): Promise<void> {
    await prisma.menuOption.delete({ where: { id } });
  }

  async findAllOptions(): Promise<MenuOptionData[]> {
    return prisma.menuOption.findMany({ include: { menu: true }, orderBy: [{ menuId: "asc" }, { orden: "asc" }] }) as any;
  }

  async findUserMenus(userId: string, isAdmin: boolean): Promise<MenuData[]> {
    if (isAdmin) {
      return prisma.menu.findMany({
        where: { activo: true },
        include: {
          options: {
            where: { activo: true },
            orderBy: { orden: "asc" },
          },
        },
        orderBy: { orden: "asc" },
      }) as any;
    }

    // Menús con opciones donde el usuario tenga acceso 'ver' permitido
    const allowedOptions = await prisma.menuOption.findMany({
      where: {
        activo: true,
        menu: { activo: true },
        roleAccess: {
          some: {
            acceso: "ver",
            permitido: true,
            role: {
              activo: true,
              userRoles: {
                some: {
                  userId,
                  activo: true,
                  OR: [
                    { vigenciaHasta: null },
                    { vigenciaHasta: { gte: new Date() } },
                  ],
                },
              },
            },
          },
        },
      },
      include: { menu: true },
      orderBy: { orden: "asc" },
    });

    const menuMap = new Map<number, MenuData>();
    for (const opt of allowedOptions) {
      if (!opt.menu) continue;
      if (!menuMap.has(opt.menu.id)) {
        menuMap.set(opt.menu.id, {
          ...(opt.menu as any),
          options: [],
        });
      }
      menuMap.get(opt.menu.id)!.options!.push(opt as any);
    }

    return Array.from(menuMap.values()).sort((a, b) => a.orden - b.orden);
  }

  async findUserPermissions(userId: string, isAdmin: boolean): Promise<any[]> {
    if (isAdmin) {
      const allOptions = await prisma.menuOption.findMany({
        where: { activo: true },
        include: { menu: true },
      });
      const accesos = ["ver", "crear", "editar", "eliminar", "exportar", "aprobar"];
      const permissions: any[] = [];
      for (const opt of allOptions) {
        for (const acc of accesos) {
          permissions.push({
            menuOptionId: opt.id,
            codigoOpcion: opt.codigo,
            nombreOpcion: opt.nombre,
            ruta: opt.ruta,
            icono: opt.icono,
            menuId: opt.menuId,
            codigoMenu: opt.menu.codigo,
            nombreMenu: opt.menu.nombre,
            acceso: acc,
            permitido: true,
          });
        }
      }
      return permissions;
    }

    const accesses = await prisma.roleOptionAccess.findMany({
      where: {
        permitido: true,
        menuOption: { activo: true },
        role: {
          activo: true,
          userRoles: {
            some: {
              userId,
              activo: true,
              OR: [
                { vigenciaHasta: null },
                { vigenciaHasta: { gte: new Date() } },
              ],
            },
          },
        },
      },
      include: {
        menuOption: {
          include: { menu: true },
        },
      },
    });

    return accesses.map((a) => ({
      menuOptionId: a.menuOptionId,
      codigoOpcion: a.menuOption.codigo,
      nombreOpcion: a.menuOption.nombre,
      ruta: a.menuOption.ruta,
      icono: a.menuOption.icono,
      menuId: a.menuOption.menuId,
      codigoMenu: a.menuOption.menu.codigo,
      nombreMenu: a.menuOption.menu.nombre,
      acceso: a.acceso,
      permitido: a.permitido,
    }));
  }
}
