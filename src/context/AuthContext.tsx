
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: string | null;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety net: if the backend (Supabase) is unreachable or slow, never
        // leave the app hanging on a blank screen. Always resolve loading.
        const safetyTimeout = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 8000);

        // Resolves a session (whitelist check included) and always clears loading,
        // even if the network call fails or hangs.
        const resolveSession = async (session: Session | null) => {
            try {
                if (session?.user?.email) {
                    const { allowed, role } = await checkWhitelist(session.user.email);
                    if (!mounted) return;
                    if (allowed) {
                        setSession(session);
                        setUser(session.user);
                        setUserRole(role);
                    } else {
                        await signOut();
                    }
                } else {
                    setSession(null);
                    setUser(null);
                    setUserRole(null);
                }
            } catch (err) {
                console.error("Auth initialization failed:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Check active session and set the user
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => resolveSession(session))
            .catch((err) => {
                console.error("getSession failed:", err);
                if (mounted) setLoading(false);
            });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            resolveSession(session);
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const checkWhitelist = async (email: string) => {
        const { data, error } = await supabase
            .from('allowed_users')
            .select('email, role')
            .eq('email', email)
            .single();

        if (error || !data) {
            console.warn(`Access denied for ${email}: Not in whitelist.`);
            return { allowed: false, role: null };
        }
        return { allowed: true, role: data.role };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, userRole, isAdmin: userRole === 'admin', loading, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
