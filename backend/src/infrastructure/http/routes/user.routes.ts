import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
const controller = new UserController();

router.use(authenticate);

router.get("/", authorize("ver", "USR_LISTA"), (req, res, next) => controller.getAll(req, res, next));
router.get("/:id", authorize("ver", "USR_LISTA"), (req, res, next) => controller.getById(req, res, next));
router.post("/", authorize("crear", "USR_CREAR"), (req, res, next) => controller.create(req, res, next));
router.put("/:id", authorize("editar", "USR_EDITAR"), (req, res, next) => controller.update(req, res, next));
router.delete("/:id", authorize("eliminar", "USR_LISTA"), (req, res, next) => controller.delete(req, res, next));

export default router;
