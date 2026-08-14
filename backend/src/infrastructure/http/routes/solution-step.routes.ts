import { Router } from "express";
import { SolutionStepController } from "../controllers/SolutionStepController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { upload } from "../middlewares/upload";

const router = Router();
const controller = new SolutionStepController();

router.use(authenticate);

router.get("/:id", authorize("ver", "SOL_PASOS"), (req, res, next) => controller.getById(req, res, next));
router.put("/:id", authorize("editar", "SOL_PASOS"), (req, res, next) => controller.update(req, res, next));
router.delete("/:id", authorize("eliminar", "SOL_PASOS"), (req, res, next) => controller.delete(req, res, next));

// Adjuntos
router.post("/:id/attachments", authorize("crear", "SOL_ADJUNTOS"), upload.single("file"), (req, res, next) => controller.uploadAttachment(req, res, next));
router.delete("/attachments/:attachmentId", authorize("eliminar", "SOL_ADJUNTOS"), (req, res, next) => controller.deleteAttachment(req, res, next));

export default router;
