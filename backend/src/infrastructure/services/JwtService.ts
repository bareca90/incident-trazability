import jwt from "jsonwebtoken";
import { JwtPayload } from "../../shared/types";
import { UnauthorizedError } from "../../shared/errors/AppError";

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  ?? "access_secret_change_me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "refresh_secret_change_me";
const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES_IN  ?? "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

export class JwtService {
  generateAccessToken(payload: Omit<JwtPayload, "sessionId"> & { sessionId: string }): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as any);
  }

  generateRefreshToken(payload: Pick<JwtPayload, "userId" | "sessionId">): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as any);
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedError("Token de acceso invÃ¡lido o expirado");
    }
  }

  verifyRefreshToken(token: string): Pick<JwtPayload, "userId" | "sessionId"> {
    try {
      return jwt.verify(token, REFRESH_SECRET) as Pick<JwtPayload, "userId" | "sessionId">;
    } catch {
      throw new UnauthorizedError("Refresh token invÃ¡lido o expirado");
    }
  }
}

export const jwtService = new JwtService();
