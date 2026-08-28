import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import roleRoutes from "./role.routes";
import menuRoutes from "./menu.routes";
import incidentRoutes from "./incident.routes";
import solutionStepRoutes from "./solution-step.routes";
import auditLogRoutes from "./audit-log.routes";
import systemRoutes from "./system.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/menus", menuRoutes);
router.use("/systems", systemRoutes);
router.use("/sistemas", systemRoutes);
router.use("/incidents", incidentRoutes);
router.use("/solution-steps", solutionStepRoutes);
router.use("/audit-logs", auditLogRoutes);

export default router;
