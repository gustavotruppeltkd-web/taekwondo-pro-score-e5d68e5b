
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the auth callback
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN") {
                navigate("/", { replace: true });
            }
        });

        // Also check current session directly in case the event fired before we mounted
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate("/", { replace: true });
            }
        });
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Verificando autenticação...</p>
        </div>
    );
};

export default AuthCallback;
