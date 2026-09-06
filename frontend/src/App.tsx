import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { RequireAuth, RedirectIfAuthed } from "./components/routes";
import { FullPageSpinner } from "./components/ui/Spinner";
import Layout from "./components/Layout";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const BoardPage = lazy(() => import("./pages/Board"));
const ListPage = lazy(() => import("./pages/Tasks"));
const DeadlinePage = lazy(() => import("./pages/Deadline"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  className:
                    "!bg-elevated !text-fg !border !border-line !shadow-lg !rounded-xl !text-[14px]",
                }}
              />
              <Suspense fallback={<FullPageSpinner />}>
                <Routes>
                  <Route element={<RedirectIfAuthed />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>

                  <Route element={<RequireAuth />}>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<BoardPage />} />
                      <Route path="deadline" element={<DeadlinePage />} />
                      <Route path="list" element={<ListPage />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
