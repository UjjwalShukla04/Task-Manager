import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { CheckCircle2, LayoutGrid } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ThemeToggle } from "../components/ui/ThemeToggle";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticating } = useAuth();
  const from = (location.state as { from?: string })?.from ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to sign in");
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2 text-indigo-600">
              <LayoutGrid className="h-7 w-7" aria-hidden />
              <span className="text-xl font-bold">TaskFlow</span>
            </span>
            <ThemeToggle />
          </div>

          <h1 className="text-2xl font-bold text-fg">Sign in</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" className="w-full" isLoading={isAuthenticating}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-muted">
            New to TaskFlow?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-grid-white" />
          <div className="flex h-full flex-col items-center justify-center px-12 text-center text-white">
            <h2 className="mb-6 text-3xl font-bold">Manage tasks with ease</h2>
            <p className="mb-8 max-w-md text-indigo-100">
              Streamline your workflow, collaborate with your team, and track
              progress in real time.
            </p>
            <ul className="grid gap-3 text-left">
              {[
                "Real-time collaboration",
                "Kanban board & list views",
                "Priority & due-date tracking",
                "Instant notifications",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-200" aria-hidden />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
