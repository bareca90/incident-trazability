import { PaginatedResult } from "../../shared/types";

export interface MenuData {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  orden: number;
  activo: boolean;
  parentId?: number | null;
  options?: MenuOptionData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuOptionData {
  id: number;
  menuId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  ruta?: string | null;
  icono?: string | null;
  orden: number;
  activo: boolean;
  menu?: MenuData;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissionData {
  menuOptionId: number;
  codigoOpcion: string;
  nombreOpcion: string;
  ruta?: string | null;
  icono?: string | null;
  menuId: number;
  codigoMenu: string;
  nombreMenu: string;
  acceso: string;
  permitido: boolean;
}

export interface IMenuRepository {
  findAllMenus(): Promise<MenuData[]>;
  findMenuById(id: number): Promise<MenuData | null>;
  createMenu(data: Omit<MenuData, "id" | "createdAt" | "updatedAt" | "options">): Promise<MenuData>;
  updateMenu(id: number, data: Partial<Omit<MenuData, "id" | "createdAt" | "updatedAt" | "options">>): Promise<MenuData>;
  deleteMenu(id: number): Promise<void>;
  findMenuOptions(menuId: number): Promise<MenuOptionData[]>;
  findMenuOptionById(id: number): Promise<MenuOptionData | null>;
  createMenuOption(data: Omit<MenuOptionData, "id" | "createdAt" | "updatedAt" | "menu">): Promise<MenuOptionData>;
  updateMenuOption(id: number, data: Partial<Omit<MenuOptionData, "id" | "menuId" | "createdAt" | "updatedAt" | "menu">>): Promise<MenuOptionData>;
  deleteMenuOption(id: number): Promise<void>;
  findAllOptions(): Promise<MenuOptionData[]>;
  findUserMenus(userId: string, isAdmin: boolean): Promise<MenuData[]>;
  findUserPermissions(userId: string, isAdmin: boolean): Promise<UserPermissionData[]>;
}
