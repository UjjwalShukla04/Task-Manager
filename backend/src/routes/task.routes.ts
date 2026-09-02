import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import validate from "../middleware/validateResource";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskFilterSchema,
} from "../dto/task.dto";
import { IdParamSchema } from "../dto/common.dto";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", validate({ body: CreateTaskSchema }), taskController.createTask);
router.get("/", validate({ query: TaskFilterSchema }), taskController.getTasks);
router.patch(
  "/:id",
  validate({ params: IdParamSchema, body: UpdateTaskSchema }),
  taskController.updateTask
);
router.delete(
  "/:id",
  validate({ params: IdParamSchema }),
  taskController.deleteTask
);

export default router;
