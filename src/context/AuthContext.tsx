
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
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.email) {
                checkWhitelist(session.user.email).then(({ allowed, role }) => {
                    if (allowed) {
                        setSession(session);
                        setUser(session.user);
                        setUserRole(role);
                    } else {
                        signOut();
                    }
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user?.email) {
                checkWhitelist(session.user.email).then(({ allowed, role }) => {
                    if (allowed) {
                        setSession(session);
                        setUser(session.user);
                        setUserRole(role);
                    } else {
                        signOut();
                    }
                    setLoading(false);
                });
            } else {
                setSession(null);
                setUser(null);
                setUserRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
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
