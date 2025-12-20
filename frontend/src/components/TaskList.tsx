import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTasks, deleteTask, updateTask } from "../api/tasks";
import { TaskItem } from "./TaskItem";
import { CreateTaskModal } from "./CreateTaskModal";
import type { Task } from "../types";
import { getSocket } from "../utils/socket";
import { Button } from "./ui/Button";
import { Plus, Filter, ArrowUpDown, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function TaskList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sortBy: "dueDate",
  });

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => getTasks(filters),
  });

  useEffect(() => {
    const socket = getSocket();

    const handleTaskCreated = (task: Task) => {
      queryClient.setQueryData(
        ["tasks", filters],
        (old: Task[] | undefined) => {
          return old ? [task, ...old] : [task];
        }
      );
      toast.success(`New task assigned: ${task.title}`, {
        id: `new-task-${task.id}`,
      });
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      queryClient.setQueryData(
        ["tasks", filters],
        (old: Task[] | undefined) => {
          return old
            ? old.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            : [updatedTask];
        }
      );
      toast.success(`Task updated: ${updatedTask.title}`, {
        id: `update-task-${updatedTask.id}`,
      });
    };

    const handleTaskDeleted = (taskId: string) => {
      queryClient.setQueryData(
        ["tasks", filters],
        (old: Task[] | undefined) => {
          return old ? old.filter((t) => t.id !== taskId) : [];
        }
      );
      toast.success("Task deleted", { id: `delete-task-${taskId}` });
    };

    socket.on("task_assigned", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_deleted", handleTaskDeleted);

    return () => {
      socket.off("task_assigned", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_deleted", handleTaskDeleted);
    };
  }, [queryClient, filters]);

  const handleDelete = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast.success("Task deleted");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTask(taskId, { status });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(undefined);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600">
        <p>Error loading tasks. Please try again later.</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 w-full sm:w-auto cursor-pointer"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Statuses</option>
                <option value="ToDo">To Do</option>
                <option value="InProgress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 w-full sm:w-auto">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <select
                className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 w-full sm:w-auto cursor-pointer"
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tasks?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No tasks found
            </h3>
            <p className="text-gray-500 mt-1 mb-6">
              Create a new task to get started!
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        ) : (
          tasks?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
