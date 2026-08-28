import { Router } from "express";
import { SystemController } from "../controllers/SystemController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
const controller = new SystemController();

router.use(authenticate);

// Listar y ver sistemas
router.get("/", (req, res, next) => controller.getAll(req, res, next));
router.get("/:id", (req, res, next) => controller.getById(req, res, next));

// Crear, editar y eliminar protegidos con permiso de configuración de sistemas
router.post("/", authorize("crear", "CONF_SISTEMAS"), (req, res, next) => controller.create(req, res, next));
router.put("/:id", authorize("editar", "CONF_SISTEMAS"), (req, res, next) => controller.update(req, res, next));
router.delete("/:id", authorize("eliminar", "CONF_SISTEMAS"), (req, res, next) => controller.delete(req, res, next));

export default router;
