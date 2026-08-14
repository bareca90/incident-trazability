import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../../../shared/errors/AppError";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Datos de entrada invÃ¡lidos",
        details: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      },
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(422).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Unexpected errors
  console.error("[ERROR]", err);
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" },
  });
};
