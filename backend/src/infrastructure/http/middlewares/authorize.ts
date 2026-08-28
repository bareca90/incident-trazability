import { Response, NextFunction } from "express";
import { prisma } from "../../database/prisma/client";
import { AuthenticatedRequest } from "../../../shared/types";
import { ForbiddenError } from "../../../shared/errors/AppError";

/**
 * Verifica si el usuario tiene el acceso requerido sobre una opción de menú.
 * Los super-admin (esAdmin=true) tienen acceso irrestricto.
 */
export const authorize = (acceso: string, menuOptionCodigo?: string) =>
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ForbiddenError();

      // Super admin: acceso total
      if (req.user.isAdmin) return next();

      if (!menuOptionCodigo) return next(); // Solo autenticación

      // Verificar si el usuario tiene un rol activo con permiso permitido
      const hasPermission = await prisma.roleOptionAccess.findFirst({
        where: {
          permitido: true,
          acceso: acceso as any,
          menuOption: {
            codigo: menuOptionCodigo,
            activo: true,
          },
          role: {
            activo: true,
            userRoles: {
              some: {
                userId: req.user.userId,
                activo: true,
                OR: [
                  { vigenciaHasta: null },
                  { vigenciaHasta: { gte: new Date() } },
                ],
              },
            },
          },
        },
      });

      if (!hasPermission) {
        throw new ForbiddenError(`No tienes permiso para realizar esta acción (${acceso} en ${menuOptionCodigo})`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
