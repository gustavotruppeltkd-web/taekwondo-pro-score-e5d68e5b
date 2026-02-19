
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/UserManagement";

const Dashboard = () => {
    const { user, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                            <User className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{user?.email}</span>
                        </div>
                        <Button variant="destructive" size="sm" onClick={signOut}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status da Sessão</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">ID do Usuário</span>
                                    <span className="font-mono text-xs">{user?.id}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">E-mail Confirmado</span>
                                    <span className={user?.email_confirmed_at ? "text-green-500" : "text-yellow-500"}>
                                        {user?.email_confirmed_at ? "Sim" : "Não"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Último Login</span>
                                    <span className="text-sm">
                                        {new Date(user?.last_sign_in_at || "").toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>Área Protegida</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Você só pode ver esta página porque está autenticado. O <strong>AuthGuard</strong> está protegendo esta rota.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Section - User Management */}
                <div className="grid gap-6">
                    <UserManagement />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
