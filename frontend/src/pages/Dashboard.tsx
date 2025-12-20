import { TaskList } from "../components/TaskList";
import { Sparkles } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <h3 className="text-2xl font-bold tracking-tight">
              Dashboard Overview
            </h3>
          </div>
          <p className="text-indigo-100 max-w-2xl text-lg">
            Manage your tasks, track progress, and collaborate with your team
            efficiently.
          </p>
        </div>
      </div>

      <TaskList />
    </div>
  );
}
