import express from "express";
import * as controller from "../controllers/auth.controller";
import { apiKeyAuth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", apiKeyAuth, controller.me);

export default router;
