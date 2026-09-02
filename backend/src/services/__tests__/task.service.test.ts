import { TaskService } from "../task.service";
import { TaskRepository } from "../../repositories/task.repository";
import { UserRepository } from "../../repositories/user.repository";
import { emitToUsers } from "../../utils/socket";
import { AppError } from "../../utils/AppError";

jest.mock("../../repositories/task.repository");
jest.mock("../../repositories/user.repository");
jest.mock("../../utils/socket");

const mockTaskRepo = TaskRepository as jest.MockedClass<typeof TaskRepository>;
const mockUserRepo = UserRepository as jest.MockedClass<typeof UserRepository>;
const mockEmit = emitToUsers as jest.Mock;

describe("TaskService", () => {
  let service: TaskService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaskService();
  });

  describe("createTask", () => {
    const input = {
      title: "Test",
      description: "d",
      dueDate: new Date(),
      priority: "High" as const,
      assignedToId: "22222222-2222-2222-2222-222222222222",
    };

    it("creates a task and notifies creator + assignee", async () => {
      const created = {
        id: "t1",
        ...input,
        creatorId: "u1",
        status: "ToDo",
      };
      mockUserRepo.prototype.findById.mockResolvedValue({ id: "u2" } as any);
      mockTaskRepo.prototype.create.mockResolvedValue(created as any);

      const result = await service.createTask("u1", input);

      expect(mockTaskRepo.prototype.create).toHaveBeenCalledWith({
        ...input,
        creatorId: "u1",
      });
      expect(mockEmit).toHaveBeenCalledWith(
        ["u1", input.assignedToId],
        "task_created",
        created
      );
      expect(mockEmit).toHaveBeenCalledWith(
        [input.assignedToId],
        "task_assigned",
        created
      );
      expect(result).toEqual(created);
    });

    it("rejects an unknown assignee", async () => {
      mockUserRepo.prototype.findById.mockResolvedValue(null);
      await expect(service.createTask("u1", input)).rejects.toThrow(
        "Assigned user not found"
      );
      expect(mockTaskRepo.prototype.create).not.toHaveBeenCalled();
    });
  });

  describe("updateTask", () => {
    it("blocks users who are neither creator nor assignee", async () => {
      mockTaskRepo.prototype.findById.mockResolvedValue({
        id: "t1",
        creatorId: "owner",
        assignedToId: "someone",
      } as any);

      await expect(
        service.updateTask("intruder", "t1", { status: "Review" })
      ).rejects.toBeInstanceOf(AppError);
      expect(mockTaskRepo.prototype.update).not.toHaveBeenCalled();
    });

    it("updates and notifies current + previous participants", async () => {
      const existing = { id: "t1", creatorId: "u1", assignedToId: "u2" };
      const updated = { ...existing, assignedToId: "u3", status: "InProgress" };
      mockTaskRepo.prototype.findById.mockResolvedValue(existing as any);
      mockUserRepo.prototype.findById.mockResolvedValue({ id: "u3" } as any);
      mockTaskRepo.prototype.update.mockResolvedValue(updated as any);

      await service.updateTask("u1", "t1", {
        assignedToId: "u3",
        status: "InProgress",
      });

      expect(mockEmit).toHaveBeenCalledWith(
        ["u1", "u3", "u2"],
        "task_updated",
        updated
      );
      expect(mockEmit).toHaveBeenCalledWith(["u3"], "task_assigned", updated);
    });
  });

  describe("deleteTask", () => {
    it("only lets the creator delete", async () => {
      mockTaskRepo.prototype.findById.mockResolvedValue({
        id: "t1",
        creatorId: "owner",
        assignedToId: "u2",
      } as any);

      await expect(service.deleteTask("u2", "t1")).rejects.toThrow(
        "Only the creator can delete this task"
      );
    });

    it("deletes and emits task_deleted with the id", async () => {
      mockTaskRepo.prototype.findById.mockResolvedValue({
        id: "t1",
        creatorId: "u1",
        assignedToId: "u2",
      } as any);
      mockTaskRepo.prototype.delete.mockResolvedValue({} as any);

      await service.deleteTask("u1", "t1");

      expect(mockTaskRepo.prototype.delete).toHaveBeenCalledWith("t1");
      expect(mockEmit).toHaveBeenCalledWith(
        ["u1", "u2"],
        "task_deleted",
        { id: "t1" }
      );
    });
  });
});
