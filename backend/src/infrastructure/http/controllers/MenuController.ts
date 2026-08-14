import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../shared/types";
import { sendSuccess, sendCreated, sendNoContent } from "../../../shared/utils/response";
import { PrismaMenuRepository } from "../../database/repositories/PrismaMenuRepository";
import { MenuUseCases } from "../../../use-cases/menus/MenuUseCases";

const menuRepo = new PrismaMenuRepository();
const menuUseCases = new MenuUseCases(menuRepo);

const createMenuSchema = z.object({
  codigo:      z.string().min(2).max(50),
  nombre:      z.string().min(2).max(150),
  descripcion: z.string().optional(),
  icono:       z.string().optional(),
  orden:       z.number().int().optional().default(0),
  activo:      z.boolean().optional().default(true),
  parentId:    z.number().int().optional(),
});

const createOptionSchema = z.object({
  menuId:      z.number().int().positive(),
  codigo:      z.string().min(2).max(100),
  nombre:      z.string().min(2).max(200),
  descripcion: z.string().optional(),
  ruta:        z.string().optional(),
  icono:       z.string().optional(),
  orden:       z.number().int().optional().default(0),
  activo:      z.boolean().optional().default(true),
});

export class MenuController {
  async getAllMenus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const menus = await menuUseCases.getAllMenus();
      sendSuccess(res, menus);
    } catch (err) { next(err); }
  }

  async createMenu(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createMenuSchema.parse(req.body);
      const menu = await menuUseCases.createMenu(input as any);
      sendCreated(res, menu);
    } catch (err) { next(err); }
  }

  async updateMenu(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const input = createMenuSchema.partial().parse(req.body);
      const menu = await menuUseCases.updateMenu(id, input as any);
      sendSuccess(res, menu);
    } catch (err) { next(err); }
  }

  async deleteMenu(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      await menuUseCases.deleteMenu(id);
      sendNoContent(res);
    } catch (err) { next(err); }
  }

  async getAllOptions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = await menuUseCases.getAllOptions();
      sendSuccess(res, options);
    } catch (err) { next(err); }
  }

  async getMenuOptions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const menuId = parseInt(String(req.params.menuId), 10);
      const options = await menuUseCases.getMenuOptions(menuId);
      sendSuccess(res, options);
    } catch (err) { next(err); }
  }

  async createMenuOption(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createOptionSchema.parse(req.body);
      const option = await menuUseCases.createMenuOption(input as any);
      sendCreated(res, option);
    } catch (err) { next(err); }
  }

  async updateMenuOption(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const input = createOptionSchema.partial().parse(req.body);
      const option = await menuUseCases.updateMenuOption(id, input as any);
      sendSuccess(res, option);
    } catch (err) { next(err); }
  }

  async deleteMenuOption(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      await menuUseCases.deleteMenuOption(id);
      sendNoContent(res);
    } catch (err) { next(err); }
  }
}
