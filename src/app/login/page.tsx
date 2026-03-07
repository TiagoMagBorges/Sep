"use client";

import { useState, SyntheticEvent } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { signIn } = useAuth();

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");
            await signIn({ email, senha: password });
        } catch (err) {
            setError("Falha na autenticação. Verifique suas credenciais.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
                <div className="w-full max-w-md mx-auto">
                    <div className="flex items-center gap-2 mb-8">
                        <BookOpen className="size-8 text-primary" />
                        <h1 className="text-2xl font-semibold text-foreground">SEP</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-semibold text-foreground mb-2">
                            Bem-vindo de volta
                        </h2>
                        <p className="text-muted-foreground">
                            Entre com suas credenciais para acessar sua conta
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                                    disabled={isLoading}
                                />
                                <label
                                    htmlFor="remember"
                                    className="text-sm text-foreground cursor-pointer select-none"
                                >
                                    Lembrar de mim
                                </label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Entrando..." : "Entrar"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Não tem uma conta?{" "}
                            <Link href="/signup" className="text-primary hover:underline">
                                Criar conta
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center">
                <div className="max-w-md text-primary-foreground px-8">
                    <h3 className="text-3xl font-semibold mb-4">
                        Gerencie suas aulas particulares
                    </h3>
                    <p className="text-lg opacity-90">
                        Sistema completo para controle de alunos, créditos de aulas e
                        finanças. Diga adeus às planilhas.
                    </p>
                </div>
            </div>
        </div>
    );
}