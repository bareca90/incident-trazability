import { Router } from "express";
import { AuditLogController } from "../controllers/AuditLogController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
const controller = new AuditLogController();

router.use(authenticate);

router.get("/", authorize("ver", "SEG_BITACORA"), (req, res, next) => controller.getAll(req, res, next));

export default router;
