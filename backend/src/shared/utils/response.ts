import { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Operación exitosa",
  statusCode = 200,
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = "Recurso creado exitosamente",
): void => sendSuccess(res, data, message, 201);

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Consulta exitosa",
): void => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};
