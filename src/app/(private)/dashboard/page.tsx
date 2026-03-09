"use client";

import { useEffect, useState } from "react";
import { Calendar, Users, AlertCircle, TrendingUp, ChevronRight, BookOpen, Clock } from "lucide-react";
import { api } from "@/services/api";
import { DashboardSummary } from "@/types/Dashboard";
import { Student } from "@/types/Student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LessonPlaceholder {
    id: string;
    studentName: string;
    subject: string;
    time: string;
    endTime: string;
}

interface PaymentPlaceholder {
    id: string;
    studentName: string;
    description: string;
    amount: number;
    status: "pending" | "overdue";
}

export default function Dashboard() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchSummary() {
            try {
                const response = await api.get<DashboardSummary>("/dashboard/summary");
                setSummary(response.data);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSummary();
    }, []);

    const todayClasses: LessonPlaceholder[] = [];
    const upcomingClasses: LessonPlaceholder[] = [];
    const students: Student[] = [];
    const lowCreditStudents: Student[] = [];
    const pendingPayments: PaymentPlaceholder[] = [];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    if (isLoading || !summary) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Bem-vindo de volta! 👋</h1>
                    <p className="text-muted-foreground mt-1 capitalize">
                        {new Date().toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Ganhos Totais</span>
                            <div className="size-9 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="size-4 text-green-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Das aulas concluídas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Pgtos. Pendentes</span>
                            <div className={`size-9 rounded-full flex items-center justify-center ${summary.pendingPayments > 0 ? "bg-red-100" : "bg-muted"}`}>
                                <AlertCircle className={`size-4 ${summary.pendingPayments > 0 ? "text-destructive" : "text-muted-foreground"}`} />
                            </div>
                        </div>
                        <p className={`text-2xl font-bold ${summary.pendingPayments > 0 ? "text-destructive" : ""}`}>
                            {formatCurrency(summary.pendingPayments)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {summary.pendingPayments > 0 ? "Alunos em atraso" : "Tudo em dia"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Aulas de Hoje</span>
                            <div className="size-9 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar className="size-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-primary">{summary.lessonsInWeek}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {summary.lessonsInWeek} agendadas na semana
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Alunos Ativos</span>
                            <div className="size-9 rounded-full bg-purple-100 flex items-center justify-center">
                                <Users className="size-4 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{summary.totalActiveStudents}</p>
                        <p className="text-xs text-muted-foreground mt-1">Neste mês</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Clock className="size-5 text-primary" />
                                Agenda de Hoje
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                Ver calendário <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {todayClasses.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma aula agendada para hoje.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <BookOpen className="size-5 text-primary" />
                                Próximas Lições
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                Ver agenda <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {upcomingClasses.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma aula próxima agendada.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Users className="size-5 text-primary" />
                                Seus Alunos
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                Ver tudo <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {students.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum aluno cadastrado.</p>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="border-orange-200 bg-orange-50/30 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-orange-800 text-base font-semibold">
                                <AlertCircle className="size-5 text-orange-500" />
                                Créditos Baixos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowCreditStudents.length === 0 && (
                                <p className="text-sm text-orange-800/70 text-center py-4">Nenhum aluno com créditos baixos.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-red-50/30 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-red-800 text-base font-semibold">
                                <AlertCircle className="size-5 text-red-500" />
                                Pagamentos Pendentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingPayments.length === 0 && (
                                <p className="text-sm text-red-800/70 text-center py-4">Nenhum pagamento pendente.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}