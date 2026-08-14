import { Router } from "express";
import { MenuController } from "../controllers/MenuController";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
const controller = new MenuController();

router.use(authenticate);

router.get("/", (req, res, next) => controller.getAllMenus(req, res, next));
router.post("/", authorize("crear", "CONF_GENERAL"), (req, res, next) => controller.createMenu(req, res, next));
router.put("/:id", authorize("editar", "CONF_GENERAL"), (req, res, next) => controller.updateMenu(req, res, next));
router.delete("/:id", authorize("eliminar", "CONF_GENERAL"), (req, res, next) => controller.deleteMenu(req, res, next));

router.get("/options/all", (req, res, next) => controller.getAllOptions(req, res, next));
router.get("/:menuId/options", (req, res, next) => controller.getMenuOptions(req, res, next));
router.post("/options", authorize("crear", "CONF_GENERAL"), (req, res, next) => controller.createMenuOption(req, res, next));
router.put("/options/:id", authorize("editar", "CONF_GENERAL"), (req, res, next) => controller.updateMenuOption(req, res, next));
router.delete("/options/:id", authorize("eliminar", "CONF_GENERAL"), (req, res, next) => controller.deleteMenuOption(req, res, next));

export default router;
