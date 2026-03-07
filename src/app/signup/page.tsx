"use client";

import { useState, SyntheticEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");

            await api.post("/auth/register", {
                nome: name,
                email,
                senha: password,
            });

            router.push("/login");
        } catch (err) {
            setError("Erro ao criar conta. Verifique os dados ou se o e-mail já está em uso.");
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
                            Comece gratuitamente
                        </h2>
                        <p className="text-muted-foreground">
                            Crie sua conta e organize suas aulas particulares
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full"
                                disabled={isLoading}
                            />
                        </div>

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
                                minLength={8}
                                className="w-full"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Mínimo de 8 caracteres
                            </p>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Criando..." : "Criar conta"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Já tem uma conta?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Fazer login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center">
                <div className="max-w-md text-primary-foreground px-8">
                    <h3 className="text-3xl font-semibold mb-6">
                        Professores particulares escolhem SEP
                    </h3>
                    <ul className="space-y-4 text-lg opacity-90">
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>Controle completo de créditos e pagamentos</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>Agenda inteligente para suas aulas</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>Relatórios detalhados em PDF</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✓</span>
                            <span>Dashboard com métricas em tempo real</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}