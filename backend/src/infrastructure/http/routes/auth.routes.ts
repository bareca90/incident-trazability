import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middlewares/authenticate";

const router = Router();
const controller = new AuthController();

router.post("/login", (req, res, next) => controller.login(req, res, next));
router.post("/refresh", (req, res, next) => controller.refresh(req, res, next));
router.post("/logout", authenticate, (req, res, next) => controller.logout(req, res, next));
router.get("/me", authenticate, (req, res, next) => controller.me(req, res, next));
router.post("/change-password", authenticate, (req, res, next) => controller.changePassword(req, res, next));

export default router;
