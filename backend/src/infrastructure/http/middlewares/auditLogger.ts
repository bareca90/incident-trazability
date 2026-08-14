import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../shared/types";
import { auditLogService } from "../../services/AuditLogService";

const METHOD_ACTION: Record<string, string> = {
  POST:   "CREATE",
  PUT:    "UPDATE",
  PATCH:  "UPDATE",
  DELETE: "DELETE",
};

/**
 * Middleware que registra automÃ¡ticamente acciones de mutaciÃ³n (POST/PUT/PATCH/DELETE).
 * Se aplica globalmente en rutas protegidas.
 */
export const auditLogger = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const method = req.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return next();

  const action = METHOD_ACTION[method] ?? method;
  const parts   = req.path.replace(/\/api\//, "").split("/");
  const entidad = parts[0] ?? "unknown";
  const id      = parts[1];

  res.on("finish", () => {
    const exitoso = res.statusCode < 400;
    auditLogService.logFromRequest(req, `${action}_${entidad.toUpperCase()}`, {
      modulo:    entidad,
      entidad,
      entidadId: id,
      exitoso,
      nivel:     exitoso ? "info" : "warning",
    }).catch(console.error);
  });

  next();
};
