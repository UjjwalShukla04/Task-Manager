import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import validate from '../middleware/validateResource';
import { CreateTaskSchema, UpdateTaskSchema } from '../dto/task.dto';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', validate(CreateTaskSchema), taskController.createTask);
router.get('/', taskController.getTasks);
router.patch('/:id', validate(UpdateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
