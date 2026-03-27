
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true, requireAdmin = false }: AuthGuardProps) => {
    const { session, loading, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return;

        if (requireAuth && !session) {
            // Redirect unauthenticated users to login
            navigate("/login", { replace: true, state: { from: location } });
        } else if (!requireAuth && session) {
            // Redirect authenticated users away from public auth pages (like login)
            navigate("/", { replace: true });
        } else if (requireAuth && session && requireAdmin && !isAdmin) {
            // Redirect authenticated non-admins away from admin pages
            navigate("/", { replace: true });
        }
    }, [session, loading, requireAuth, requireAdmin, isAdmin, navigate, location]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Prevent flash of content while redirecting
    if ((requireAuth && !session) || (!requireAuth && session) || (requireAuth && session && requireAdmin && !isAdmin)) {
        return null;
    }

    return <>{children}</>;
};
