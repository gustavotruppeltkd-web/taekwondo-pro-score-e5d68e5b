import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Protected Root Route (Scoreboard) */}
            <Route
              path="/"
              element={
                <AuthGuard requireAuth={true}>
                  <Index />
                </AuthGuard>
              }
            />

            {/* Public Routes (only accessible if NOT logged in) */}
            <Route
              path="/login"
              element={
                <AuthGuard requireAuth={false}>
                  <Login />
                </AuthGuard>
              }
            />

            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes (only accessible if logged in) */}
            <Route
              path="/app"
              element={
                <AuthGuard requireAuth={true}>
                  <Dashboard />
                </AuthGuard>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider >
  </QueryClientProvider >
);

export default App;
