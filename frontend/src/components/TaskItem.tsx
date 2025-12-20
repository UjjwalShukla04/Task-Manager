import type { Task } from "../types";
import { Button } from "./ui/Button";
import { Pencil, Trash2, Calendar, AlertCircle } from "lucide-react";
import { cn } from "../utils/cn";
import { format, isPast } from "date-fns";
import { useAuth } from "../context/AuthContext";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
}

export function TaskItem({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskItemProps) {
  const { user } = useAuth();
  const isCreator = user?.id === task.creatorId;

  const priorityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-blue-100 text-blue-800",
    High: "bg-orange-100 text-orange-800",
    Urgent: "bg-red-100 text-red-800",
  };

  const statusColors = {
    ToDo: "bg-gray-100 text-gray-800",
    InProgress: "bg-yellow-100 text-yellow-800",
    Review: "bg-purple-100 text-purple-800",
    Completed: "bg-green-100 text-green-800",
  };

  const isOverdue =
    isPast(new Date(task.dueDate)) && task.status !== "Completed";

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow",
        isOverdue && "border-red-300 bg-red-50"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3
          className={cn(
            "text-lg font-medium line-clamp-1",
            isOverdue ? "text-red-700" : "text-gray-900"
          )}
        >
          {task.title}
        </h3>
        <div className="flex items-center space-x-2">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              statusColors[task.status]
            )}
          >
            {task.status}
          </span>
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
        {task.description}
      </p>

      <div
        className={cn(
          "flex items-center text-sm mb-4 space-x-4",
          isOverdue ? "text-red-600" : "text-gray-500"
        )}
      >
        <div className="flex items-center">
          {isOverdue ? (
            <AlertCircle className="h-4 w-4 mr-1" />
          ) : (
            <Calendar className="h-4 w-4 mr-1" />
          )}
          {format(new Date(task.dueDate), "MMM d, yyyy")}
        </div>
        {task.assignedTo && (
          <div
            className="flex items-center"
            title={`Assigned to ${task.assignedTo.name}`}
          >
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-medium">
              {task.assignedTo.name.charAt(0)}
            </div>
            <span className="ml-1 text-xs">{task.assignedTo.name}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <select
          value={task.status}
          onChange={(e) =>
            onStatusChange(task.id, e.target.value as Task["status"])
          }
          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ToDo">To Do</option>
          <option value="InProgress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4 text-gray-500" />
          </Button>
          {isCreator && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
