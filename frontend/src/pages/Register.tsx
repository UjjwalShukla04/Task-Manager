import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { LayoutGrid, Shield, Users, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ThemeToggle } from "../components/ui/ThemeToggle";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

const perks = [
  { icon: Zap, title: "Fast", text: "Optimistic UI and realtime sync." },
  { icon: Shield, title: "Secure", text: "HttpOnly cookie auth, rate limited." },
  { icon: Users, title: "Collaborative", text: "Assign work and get notified." },
];

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticating } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to register");
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

          <h1 className="text-2xl font-bold text-fg">Create your account</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Start organising your work today.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <Input
              label="Full name"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button type="submit" className="w-full" isLoading={isAuthenticating}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-grid-white" />
          <div className="flex h-full flex-col items-center justify-center gap-8 px-12 text-white">
            <h2 className="text-3xl font-bold">Join your team</h2>
            <ul className="grid w-full max-w-md gap-5">
              {perks.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="rounded-lg bg-white/10 p-2 backdrop-blur-sm">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-sm text-indigo-100">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
