import { TaskService } from "../task.service";
import { TaskRepository } from "../../repositories/task.repository";
import { UserRepository } from "../../repositories/user.repository";
import { getIO } from "../../utils/socket";
import { AppError } from "../../utils/AppError";

jest.mock("../../repositories/task.repository");
jest.mock("../../repositories/user.repository");
jest.mock("../../utils/socket");

const mockTaskRepository = TaskRepository as jest.MockedClass<
  typeof TaskRepository
>;
const mockUserRepository = UserRepository as jest.MockedClass<
  typeof UserRepository
>;
const mockGetIO = getIO as jest.Mock;

describe("TaskService", () => {
  let taskService: TaskService;
  let mockIO: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIO = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    mockGetIO.mockReturnValue(mockIO);
    taskService = new TaskService();
  });

  describe("createTask", () => {
    it("should create a task and emit socket events", async () => {
      const taskData = {
        title: "Test Task",
        description: "Desc",
        dueDate: new Date(),
        priority: "High" as any,
        assignedToId: "user2",
      };

      const createdTask = {
        id: "task1",
        ...taskData,
        creatorId: "user1",
        status: "ToDo" as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.prototype.findById.mockResolvedValue({
        id: "user2",
      } as any);
      mockTaskRepository.prototype.create.mockResolvedValue(createdTask as any);

      const result = await taskService.createTask("user1", taskData);

      expect(mockTaskRepository.prototype.create).toHaveBeenCalled();
      expect(mockIO.to).toHaveBeenCalledWith("user2");
      expect(mockIO.emit).toHaveBeenCalledWith("task_assigned", createdTask);
      expect(result).toEqual(createdTask);
    });

    it("should throw error if assigned user does not exist", async () => {
      const taskData = {
        title: "Test Task",
        description: "Desc",
        dueDate: new Date(),
        priority: "High" as any,
        assignedToId: "non-existent",
      };

      mockUserRepository.prototype.findById.mockResolvedValue(null);

      await expect(taskService.createTask("user1", taskData)).rejects.toThrow(
        "Assigned user not found"
      );

      expect(mockTaskRepository.prototype.create).not.toHaveBeenCalled();
    });
  });

  describe("updateTask", () => {
    it("should update task and notify relevant users", async () => {
      const taskData = {
        status: "InProgress" as any,
      };

      const existingTask = {
        id: "task1",
        title: "Task",
        creatorId: "user1",
        assignedToId: "user2",
      };

      const updatedTask = {
        ...existingTask,
        ...taskData,
      };

      mockTaskRepository.prototype.findById.mockResolvedValue(
        existingTask as any
      );
      mockTaskRepository.prototype.update.mockResolvedValue(updatedTask as any);

      await taskService.updateTask("user1", "task1", taskData);

      expect(mockTaskRepository.prototype.update).toHaveBeenCalledWith(
        "task1",
        taskData
      );
      // Creator notified
      expect(mockIO.to).toHaveBeenCalledWith("user1");
      // Assignee notified
      expect(mockIO.to).toHaveBeenCalledWith("user2");
      expect(mockIO.emit).toHaveBeenCalledWith("task_updated", updatedTask);
    });
  });
});
