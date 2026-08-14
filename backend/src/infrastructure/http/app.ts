import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";

import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { auditLogger } from "./middlewares/auditLogger";

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  credentials: true,
}));

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX ?? "100"),
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Demasiadas peticiones desde esta IP" } },
});
app.use("/api", globalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Exceso de intentos de login. Intente mÃƒÂ¡s tarde." } },
});
app.use("/api/auth/login", loginLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadDir));

app.use("/api", auditLogger);
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
