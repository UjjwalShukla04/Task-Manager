import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import validate from "../middleware/validateResource";
import { RegisterSchema, LoginSchema } from "../dto/auth.dto";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", validate(RegisterSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login);
router.get("/me", protect, authController.getProfile);
router.get("/users", protect, authController.getAllUsers);
router.post("/logout", authController.logout);

export default router;
