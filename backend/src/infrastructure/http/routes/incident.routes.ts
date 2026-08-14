import { Router } from "express";
import { IncidentController } from "../controllers/IncidentController";
import { SolutionStepController } from "../controllers/SolutionStepController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
const controller = new IncidentController();
const stepController = new SolutionStepController();

router.use(authenticate);

router.get("/", authorize("ver", "INC_LISTA"), (req, res, next) => controller.getAll(req, res, next));
router.get("/:id", authorize("ver", "INC_DETALLE"), (req, res, next) => controller.getById(req, res, next));
router.post("/", authorize("crear", "INC_NUEVA"), (req, res, next) => controller.create(req, res, next));
router.put("/:id", authorize("editar", "INC_DETALLE"), (req, res, next) => controller.update(req, res, next));
router.delete("/:id", authorize("eliminar", "INC_LISTA"), (req, res, next) => controller.delete(req, res, next));

// Solution Steps asociados a la incidencia
router.get("/:incidentId/steps", authorize("ver", "SOL_PASOS"), (req, res, next) => stepController.getByIncident(req, res, next));
router.post("/:incidentId/steps", authorize("crear", "SOL_PASOS"), (req, res, next) => stepController.create(req, res, next));

export default router;
