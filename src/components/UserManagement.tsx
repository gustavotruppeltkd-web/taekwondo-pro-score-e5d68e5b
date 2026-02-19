import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, UserPlus, ShieldAlert, Loader2 } from "lucide-react";

interface AllowedUser {
    id: string;
    email: string;
    role: string;
    created_at: string;
}

export function UserManagement() {
    const [users, setUsers] = useState<AllowedUser[]>([]);
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("allowed_users")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
            // Don't show toast error here to avoid spamming if not admin (RLS will block)
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const addUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;

        setAdding(true);
        const { error } = await supabase
            .from("allowed_users")
            .insert([{ email: newEmail.toLowerCase().trim() }]);

        if (error) {
            toast({
                variant: "destructive",
                title: "Erro ao adicionar",
                description: error.message,
            });
        } else {
            toast({
                title: "Usuário convidado!",
                description: `${newEmail} agora pode fazer login.`,
            });
            setNewEmail("");
            fetchUsers();
        }
        setAdding(false);
    };

    const removeUser = async (email: string) => {
        const { error } = await supabase
            .from("allowed_users")
            .delete()
            .eq("email", email);

        if (error) {
            toast({
                variant: "destructive",
                title: "Erro ao remover",
                description: error.message,
            });
        } else {
            toast({
                title: "Usuário removido",
                description: "Acesso revogado.",
            });
            fetchUsers();
        }
    };

    // If request failed silently (RLS), we might not be admin.
    // Ideally we check permission before rendering, but RLS handles security.

    return (
        <Card className="border-primary/20 bg-black/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    Gestão de Acessos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Add User Form */}
                <form onSubmit={addUser} className="flex gap-2">
                    <Input
                        type="email"
                        placeholder="Novo e-mail autorizado..."
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="bg-background/50"
                        required
                    />
                    <Button type="submit" disabled={adding}>
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        <span className="ml-2 hidden sm:inline">Adicionar</span>
                    </Button>
                </form>

                {/* User List */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Usuários Permitidos ({users.length})
                    </h3>

                    {loading ? (
                        <div className="text-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-white/5 group hover:border-white/10 transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm">{user.email}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">
                                            {user.role} • {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {user.role !== 'admin' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeUser(user.email)}
                                            className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                                            title="Revogar acesso"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {users.length === 0 && (
                                <p className="text-center text-muted-foreground py-4 text-sm">
                                    Nenhum usuário encontrado. (Você é admin?)
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
