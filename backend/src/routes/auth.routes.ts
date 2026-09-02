import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import validate from "../middleware/validateResource";
import { RegisterSchema, LoginSchema } from "../dto/auth.dto";
import { protect } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate({ body: RegisterSchema }),
  authController.register
);
router.post(
  "/login",
  authLimiter,
  validate({ body: LoginSchema }),
  authController.login
);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getProfile);
router.get("/users", protect, authController.getAllUsers);

export default router;
