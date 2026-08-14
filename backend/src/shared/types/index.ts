import { Request } from "express";

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface FilterParams {
  search?: string;
  [key: string]: unknown;
}
