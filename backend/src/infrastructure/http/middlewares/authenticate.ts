import { Response, NextFunction } from "express";
import { jwtService } from "../../services/JwtService";
import { AuthenticatedRequest } from "../../../shared/types";
import { UnauthorizedError } from "../../../shared/errors/AppError";

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token de autorización requerido");
    }
    const token = authHeader.slice(7);
    req.user = jwtService.verifyAccessToken(token);
    next();
  } catch (err) {
    next(err);
  }
};
