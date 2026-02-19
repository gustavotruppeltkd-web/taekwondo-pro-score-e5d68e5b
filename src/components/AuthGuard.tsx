
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
    const { session, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return;

        if (requireAuth && !session) {
            // Redirect unauthenticated users to login
            navigate("/login", { replace: true, state: { from: location } });
        } else if (!requireAuth && session) {
            // Redirect authenticated users away from public auth pages (like login)
            navigate("/app", { replace: true });
        }
    }, [session, loading, requireAuth, navigate, location]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Prevent flash of content while redirecting
    if ((requireAuth && !session) || (!requireAuth && session)) {
        return null;
    }

    return <>{children}</>;
};
