"use client";

import { useState, useMemo } from "react";
import {
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    BookOpen,
    Clock,
    Filter,
    Plus,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddPaymentModal } from "@/components/add-payment-modal";

import { useFinances } from "@/hooks/useFinances";
import { useSchedule } from "@/hooks/useSchedule";
import { LessonStatus } from "@/types/Lesson";

export default function FinancesPage() {
    const today = new Date();
    const [startDate, setStartDate] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(endOfMonth(today), "yyyy-MM-dd"));
    const [filterApplied, setFilterApplied] = useState(false);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

    const { transactions, saveFinance } = useFinances(startDate, endDate);
    const { lessons } = useSchedule(today);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const completedClasses = lessons.filter((c) => c.status === LessonStatus.COMPLETED);

    const paidAmount = transactions.filter(t => t.status === "PAID").reduce((acc, t) => acc + t.amount, 0);
    const unpaidAmount = transactions.filter(t => t.status === "PENDING").reduce((acc, t) => acc + t.amount, 0);
    const overdueAmount = transactions.filter(t => t.status === "OVERDUE").reduce((acc, t) => acc + t.amount, 0);

    const paidCount = transactions.filter(t => t.status === "PAID").length;
    const unpaidCount = transactions.filter(t => t.status === "PENDING").length;
    const overdueCount = transactions.filter(t => t.status === "OVERDUE").length;

    const totalIncome = paidAmount;
    const pendingAmount = unpaidAmount + overdueAmount;
    const totalLessons = completedClasses.length;
    const avgHourlyRate = totalLessons > 0 ? totalIncome / totalLessons : 0;

    const pendingTransactions = transactions.filter(t => t.status === "PENDING" || t.status === "OVERDUE");

    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
        .slice(0, 8);

    const revenueByStudent = useMemo(() => {
        const map = new Map();

        transactions.forEach(t => {
            if (!map.has(t.studentId)) {
                map.set(t.studentId, { studentId: t.studentId, studentName: t.studentName, totalRevenue: 0, pendingRevenue: 0, totalLessons: 0 });
            }
            const s = map.get(t.studentId);
            if (t.status === "PAID") s.totalRevenue += t.amount;
            else s.pendingRevenue += t.amount;
        });

        completedClasses.forEach(l => {
            if (map.has(l.studentId)) {
                map.get(l.studentId).totalLessons += 1;
            }
        });

        return Array.from(map.values());
    }, [transactions, completedClasses]);

    const monthlyEarningsData = useMemo(() => {
        const map = new Map<string, number>();
        transactions.filter(t => t.status === "PAID").forEach(t => {
            const month = format(parseISO(t.dueDate), "MMM", { locale: ptBR });
            map.set(month, (map.get(month) || 0) + t.amount);
        });
        return Array.from(map.entries()).map(([month, value]) => ({ month, value }));
    }, [transactions]);

    const handleApplyFilter = () => setFilterApplied(true);
    const handleClearFilter = () => {
        setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
        setFilterApplied(false);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="rounded-2xl bg-primary px-6 py-8 text-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Painel Financeiro</h1>
                        <p className="mt-1 text-white/75">
                            Acompanhe seus ganhos, monitore tendências e gerencie pagamentos pendentes.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddPaymentModalOpen(true)}
                        className="bg-white text-primary hover:bg-white/90 gap-2"
                    >
                        <Plus className="size-4" /> Registrar Pagamento
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex-1 space-y-1 w-full">
                            <Label className="text-sm">Data de início</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="flex-1 space-y-1 w-full">
                            <Label className="text-sm">Data de término</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button onClick={handleApplyFilter} className="w-full sm:w-auto bg-primary hover:bg-primary/90 gap-2">
                                <Filter className="size-4" /> Aplicar
                            </Button>
                            {filterApplied && (
                                <Button variant="outline" onClick={handleClearFilter} className="w-full sm:w-auto">
                                    Limpar
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-xl font-semibold mb-4">Visão Geral Financeira</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">Ganhos totais</span>
                                <div className="size-9 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="size-4 text-green-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Receita confirmada</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">Pendentes</span>
                                <div className="size-9 rounded-full bg-orange-100 flex items-center justify-center">
                                    <AlertCircle className="size-4 text-orange-500" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Aulas não remuneradas</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">Aulas dadas</span>
                                <div className="size-9 rounded-full bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="size-4 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-primary">{totalLessons}</p>
                            <p className="text-xs text-muted-foreground mt-1">Sessões concluídas</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">Taxa média</span>
                                <div className="size-9 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Clock className="size-4 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgHourlyRate)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Por aula concluída</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="size-5 text-primary" /> Tendências de Ganhos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyEarningsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#0F4C81" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} textAnchor="end" />
                                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), "Ganhos"]} />
                                <Area type="monotone" dataKey="value" stroke="#0F4C81" strokeWidth={2.5} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-xl font-semibold mb-4">Detalhamento do Status de Pagamento</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-green-200 bg-green-50/30 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle2 className="size-5 text-green-600" />
                                <span className="font-medium text-green-800">Pago</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700">{formatCurrency(paidAmount)}</p>
                            <p className="text-sm text-green-600 mt-1">{paidCount} transações</p>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-red-50/30 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertCircle className="size-5 text-red-500" />
                                <span className="font-medium text-red-800">Atrasado</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700">{formatCurrency(overdueAmount)}</p>
                            <p className="text-sm text-red-600 mt-1">{overdueCount} transações</p>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50/30 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertCircle className="size-5 text-orange-500" />
                                <span className="font-medium text-orange-800">Pendente</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-700">{formatCurrency(unpaidAmount)}</p>
                            <p className="text-sm text-orange-600 mt-1">{unpaidCount} transações</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Receita por Aluno</h2>
                    <div className="space-y-3">
                        {revenueByStudent.length === 0 && <p className="text-muted-foreground text-sm">Sem dados no período.</p>}
                        {revenueByStudent.map((item) => (
                            <Card key={item.studentId} className="shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <span className="font-bold text-primary text-sm">{item.studentName.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.studentName}</p>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                                                        {item.totalLessons} aulas no período
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Recebido</p>
                                                    <p className="font-bold text-green-600">{formatCurrency(item.totalRevenue)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">A Receber</p>
                                                    <p className="font-bold text-orange-600">{formatCurrency(item.pendingRevenue)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="size-5 text-destructive" /> Atrasos e Pendências
                    </h2>
                    {pendingTransactions.length === 0 ? (
                        <Card className="shadow-sm">
                            <CardContent className="text-center py-10 text-muted-foreground">
                                <CheckCircle2 className="size-12 mx-auto mb-3 text-green-500" />
                                <p>Todos os pagamentos em dia! 🎉</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {pendingTransactions.map((t) => (
                                <div key={t.id} className={`p-4 border-2 rounded-xl ${t.status === "OVERDUE" ? "border-destructive bg-red-50" : "border-orange-300 bg-orange-50"}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{t.studentName}</p>
                                                <Badge variant="outline" className={t.status === "OVERDUE" ? "bg-red-100 text-red-800 border-red-300" : "bg-orange-100 text-orange-800 border-orange-300"}>
                                                    {t.status === "OVERDUE" ? "Atrasado" : "Pendente"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Vencimento: {formatDate(t.dueDate)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold">{formatCurrency(t.amount)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="size-5" /> Histórico Recente
                </h2>
                <Card className="shadow-sm">
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {recentTransactions.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${t.status === "PAID" ? "bg-green-100" : t.status === "OVERDUE" ? "bg-red-100" : "bg-orange-100"}`}>
                                            {t.status === "PAID" ? <CheckCircle2 className="size-5 text-green-600" /> : <AlertCircle className={`size-5 ${t.status === "OVERDUE" ? "text-red-600" : "text-orange-600"}`} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{t.studentName}</p>
                                            <p className="text-sm text-muted-foreground truncate">{t.description}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(t.dueDate)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className="font-bold">{formatCurrency(t.amount)}</p>
                                        <Badge variant="outline" className={t.status === "PAID" ? "bg-green-50 text-green-700 border-green-200" : t.status === "OVERDUE" ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                                            {t.status === "PAID" && "Pago"}
                                            {t.status === "OVERDUE" && "Atrasado"}
                                            {t.status === "PENDING" && "Pendente"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AddPaymentModal open={isAddPaymentModalOpen} onOpenChange={setIsAddPaymentModalOpen} />
        </div>
    );
}