
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle2, Shield, Activity } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    // particles configuration
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                throw error;
            }

            setSubmitted(true);
            toast({
                title: "LINK ENVIADO!",
                description: "Verifique seu e-mail para acessar o sistema.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao enviar link",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-chung/20 via-background to-hong/20 opacity-50 z-0" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md relative z-10"
                >
                    <Card className="text-center border-white/10 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] bg-background/40 backdrop-blur-xl">
                        <CardContent className="pt-10 pb-8 px-6 space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                className="mx-auto mb-4 bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                            >
                                <CheckCircle2 className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                            </motion.div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-orbitron font-bold tracking-wider text-white uppercase drop-shadow-md">
                                    E-mail Enviado
                                </h2>
                                <p className="text-muted-foreground text-lg px-4">
                                    Enviamos um link de acesso para <br />
                                    <span className="font-mono text-primary font-bold tracking-wide">{email}</span>
                                </p>
                            </div>

                            <p className="text-sm text-white/50 bg-white/5 py-3 px-4 rounded-lg border border-white/5">
                                Clique no link enviado para entrar na sua conta. <br />Você pode fechar esta aba.
                            </p>

                            <Button
                                variant="outline"
                                onClick={() => setSubmitted(false)}
                                className="w-full h-12 border-white/20 hover:bg-white/10 text-white font-bold tracking-wider uppercase transition-all duration-300"
                            >
                                Entrar com outro e-mail
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden font-sans selection:bg-primary/30">
            {/* Interactive Background Tech Elements */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,0),_rgba(0,0,0,1))]" />

                <motion.div
                    animate={{
                        x: [0, 30, -20, 0],
                        y: [0, -50, 20, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-chung/10 blur-[100px]"
                />

                <motion.div
                    animate={{
                        x: [0, -40, 20, 0],
                        y: [0, 60, -30, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-hong/10 blur-[100px]"
                />
            </div>

            {/* Moving Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] z-0 pointer-events-none opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-white/10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] bg-card/60 backdrop-blur-2xl overflow-hidden group hover:border-white/20 transition-colors duration-500">
                    {/* Top Decorative Line with Pulse */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chung via-white/50 to-hong opacity-80" />
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="absolute top-0 left-0 w-full h-[2px] bg-primary blur-[2px]"
                    />

                    <CardContent className="pt-10 pb-8 px-8 flex flex-col gap-8">

                        {/* Header Section */}
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500 ease-out"
                            >
                                <Shield className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h1 className="text-4xl font-orbitron font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm uppercase">
                                    Acesso
                                </h1>
                            </motion.div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-4"
                            >
                                <div className="relative group/input">
                                    <div className="absolute left-3 top-3.5 flex items-center justify-center w-8 h-8 rounded-md bg-white/5 border border-white/5 text-muted-foreground group-focus-within/input:text-primary group-focus-within/input:bg-primary/10 group-focus-within/input:border-primary/20 transition-all duration-300">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="DIGITE SEU E-MAIL"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-14 h-14 bg-black/40 border-white/10 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-primary/50 text-white placeholder:text-white/20 font-orbitron tracking-wider text-sm transition-all duration-300 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-orbitron font-bold tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] transition-all duration-300 active:scale-[0.98] border border-primary/50 relative overflow-hidden group/btn"
                                    disabled={loading}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <Activity className="animate-spin h-5 w-5" />
                                                CONECTANDO...
                                            </>
                                        ) : (
                                            <>
                                                ENVIAR CHAVE DE ACESSO
                                            </>
                                        )}
                                    </span>
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Footer Branding - Kept simple but updated */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-6 left-0 right-0 text-center pointer-events-none"
            >
                <p className="font-orbitron text-xs text-white tracking-[0.5em] uppercase">
                    Taekwondo Pro Scoreboard
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
