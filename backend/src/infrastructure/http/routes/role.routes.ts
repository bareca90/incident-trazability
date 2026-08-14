import { Router } from "express";
import { RoleController } from "../controllers/RoleController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
const controller = new RoleController();

router.use(authenticate);

router.get("/", authorize("ver", "SEG_ROLES"), (req, res, next) => controller.getAll(req, res, next));
router.get("/:id", authorize("ver", "SEG_ROLES"), (req, res, next) => controller.getById(req, res, next));
router.post("/", authorize("crear", "SEG_ROLES"), (req, res, next) => controller.create(req, res, next));
router.put("/:id", authorize("editar", "SEG_ROLES"), (req, res, next) => controller.update(req, res, next));
router.delete("/:id", authorize("eliminar", "SEG_ROLES"), (req, res, next) => controller.delete(req, res, next));

router.get("/:id/permissions", authorize("ver", "SEG_PERMISOS"), (req, res, next) => controller.getPermissions(req, res, next));
router.put("/:id/permissions", authorize("editar", "SEG_PERMISOS"), (req, res, next) => controller.setPermissions(req, res, next));

router.get("/users/:userId", authorize("ver", "SEG_ROLES"), (req, res, next) => controller.getUserRoles(req, res, next));
router.post("/users/:userId", authorize("editar", "SEG_ROLES"), (req, res, next) => controller.assignRoleToUser(req, res, next));
router.delete("/users/:userId/:roleId", authorize("eliminar", "SEG_ROLES"), (req, res, next) => controller.removeRoleFromUser(req, res, next));

export default router;
