"use client";

import { useEffect, useState } from "react";
import { Calendar, Users, AlertCircle, TrendingUp, ChevronRight, BookOpen, Clock } from "lucide-react";
import { api } from "@/services/api";
import { DashboardSummary } from "@/types/Dashboard";
import { BillingType } from "@/types/Student";
import { LessonStatus } from "@/types/Lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/hooks/useStudents";
import { useSchedule } from "@/hooks/useSchedule";
import Link from "next/link";

export default function Dashboard() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);

    const [isLoadingSummary, setIsLoadingSummary] = useState(true);

    const [currentDate] = useState(() => new Date());

    const { students } = useStudents();

    const { lessons } = useSchedule(currentDate);

    useEffect(() => {
        async function fetchSummary() {
            try {
                const response = await api.get<DashboardSummary>("/dashboard/summary");
                setSummary(response.data);
            } finally {
                setIsLoadingSummary(false);
            }
        }
        fetchSummary();
    }, []);

    const extractTime = (isoString: string) => new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const todayStr = new Date().toISOString().split('T')[0];

    const todayClasses = lessons.filter(l => l.dateTime.startsWith(todayStr) && l.status === LessonStatus.SCHEDULED)
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    const upcomingClasses = lessons.filter(l => !l.dateTime.startsWith(todayStr) && new Date(l.dateTime) > new Date() && l.status === LessonStatus.SCHEDULED)
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    const zeroedCreditStudents = students.filter(s => s.billingType === BillingType.CREDIT_PACKAGE && s.creditBalance <= 0);
    const lowCreditStudents = students.filter(s => s.billingType === BillingType.CREDIT_PACKAGE && s.creditBalance > 0 && s.creditBalance <= 3);

    const pendingPayments: any[] = [];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    if (isLoadingSummary || !summary) return null;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
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
                            <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
                                <Link href="/schedule">Ver calendário <ChevronRight className="size-4" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {todayClasses.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma aula agendada para hoje.</p>
                        ) : (
                            <div className="space-y-3">
                                {todayClasses.slice(0, 4).map(lesson => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-10 bg-primary rounded-full"></div>
                                            <div>
                                                <p className="font-semibold text-sm">{lesson.studentName}</p>
                                                <p className="text-xs text-muted-foreground">{lesson.subject}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{extractTime(lesson.dateTime)}</p>
                                            <p className="text-xs text-muted-foreground">{extractTime(lesson.endTime)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                            <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
                                <Link href="/schedule">Ver agenda <ChevronRight className="size-4" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {upcomingClasses.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma aula próxima agendada.</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingClasses.slice(0, 4).map(lesson => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-xs font-bold text-primary">{lesson.studentName.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{lesson.studentName}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(lesson.dateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-md">
                                            {extractTime(lesson.dateTime)}
                                        </span>
                                    </div>
                                ))}
                            </div>
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
                            <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
                                <Link href="/students">Ver tudo <ChevronRight className="size-4" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {students.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum aluno cadastrado.</p>
                        ) : (
                            <div className="space-y-3">
                                {students.slice(0, 5).map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-2 border-b last:border-0">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{student.name}</span>
                                            <span className="text-xs text-muted-foreground">{student.subject}</span>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {student.billingType === BillingType.MONTHLY ? 'Mensalidade' : `${student.creditBalance} créditos`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {/* Alerta Incisivo: Créditos Zerados/Negativos */}
                    {zeroedCreditStudents.length > 0 && (
                        <Card className="border-red-300 bg-red-50 shadow-sm animate-pulse ring-2 ring-red-500/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-red-800 text-base font-semibold">
                                    <AlertCircle className="size-5 text-red-600" />
                                    Créditos Esgotados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {zeroedCreditStudents.map(student => (
                                        <div key={student.id} className="flex justify-between items-center bg-background/50 p-2 rounded border border-red-200">
                                            <span className="font-medium text-red-900 text-sm">{student.name}</span>
                                            <span className="text-red-700 font-bold text-sm">{student.creditBalance}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-orange-200 bg-orange-50/30 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-orange-800 text-base font-semibold">
                                <AlertCircle className="size-5 text-orange-500" />
                                Créditos Baixos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowCreditStudents.length === 0 ? (
                                <p className="text-sm text-orange-800/70 text-center py-4">Nenhum aluno com créditos baixos.</p>
                            ) : (
                                <div className="space-y-2">
                                    {lowCreditStudents.map(student => (
                                        <div key={student.id} className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-orange-900">{student.name}</span>
                                            <span className="text-orange-700 font-medium">{student.creditBalance}</span>
                                        </div>
                                    ))}
                                </div>
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