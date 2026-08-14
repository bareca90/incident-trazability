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

      // Consultar vista de permisos efectivos
      const result = await prisma.$queryRaw<Array<{ permitido: boolean }>>`
        SELECT permitido
        FROM trazabilidad.v_user_effective_permissions
        WHERE user_id = ${req.user.userId}::uuid
          AND opcion_codigo = ${menuOptionCodigo}
          AND acceso = ${acceso}::trazabilidad.tipo_acceso
        LIMIT 1
      `;

      if (!result.length || !result[0].permitido) {
        throw new ForbiddenError(`No tienes permiso para realizar esta acción (${acceso} en ${menuOptionCodigo})`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
