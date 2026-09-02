import { Response, NextFunction } from "express";
import { TaskService } from "../services/task.service";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
} from "../dto/task.dto";

const taskService = new TaskService();

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await taskService.createTask(
      req.user!.id,
      req.body as CreateTaskInput
    );
    res.status(201).json({ status: "success", data: { task } });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = req.validatedQuery as TaskFilterInput;
    const { tasks, pagination } = await taskService.getTasks(
      req.user!.id,
      filters
    );
    res.status(200).json({ status: "success", data: { tasks }, pagination });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await taskService.updateTask(
      req.user!.id,
      req.params.id,
      req.body as UpdateTaskInput
    );
    res.status(200).json({ status: "success", data: { task } });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await taskService.deleteTask(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
