"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, CheckCircle2, XCircle, Clock, DollarSign, TrendingUp, BookOpen, FileText } from "lucide-react";
import { api } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickClassFinishModal } from "@/components/quick-class-finish-modal";

import { Student, BillingType } from "@/types/Student";
import { Lesson, LessonStatus, LessonRequest } from "@/types/Lesson";
import { FinanceTransaction } from "@/hooks/useFinances";

export default function StudentDetailPage() {
    const params = useParams();
    const studentId = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [classes, setClasses] = useState<Lesson[]>([]);
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showAddCredits, setShowAddCredits] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Lesson | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const currentYear = new Date().getFullYear();
            const startStr = `${currentYear}-01-01`;
            const endStr = `${currentYear}-12-31`;

            const [studentRes, classesRes, financesRes] = await Promise.all([
                api.get<any>(`/students?size=100`),
                api.get<Lesson[]>(`/lessons?start=${startStr}T00:00:00&end=${endStr}T23:59:59`),
                api.get<FinanceTransaction[]>(`/finances?start=${startStr}&end=${endStr}`)
            ]);

            const foundStudent = studentRes.data.content.find((s: Student) => s.id === studentId);
            setStudent(foundStudent || null);

            const studentClasses = classesRes.data
                .filter(c => c.studentId === studentId)
                .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
            setClasses(studentClasses);

            const studentFinances = financesRes.data
                .filter(t => t.studentId === studentId)
                .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
            setTransactions(studentFinances);

        } catch (error) {
            console.error("Error fetching student details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) fetchData();
    }, [studentId]);

    const completedClasses = classes.filter((c) => c.status === LessonStatus.COMPLETED);
    const paidRevenue = transactions.filter(t => t.status === "PAID").reduce((sum, t) => sum + t.amount, 0);
    const pendingRevenue = transactions.filter(t => t.status === "PENDING" || t.status === "OVERDUE").reduce((sum, t) => sum + t.amount, 0);
    const totalRevenue = paidRevenue + pendingRevenue;

    const formatDate = (isoStr: string) => {
        return new Date(isoStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    };

    const formatTime = (isoStr: string) => {
        return new Date(isoStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    const handleGeneratePDF = async () => {
        try {
            const currentYear = new Date().getFullYear();
            const startStr = `${currentYear}-01-01`;
            const endStr = `${currentYear}-12-31`;

            const response = await api.get(`/reports/student/${studentId}`, {
                params: { start: startStr, end: endStr },
                responseType: "blob"
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `relatorio_${student?.name.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: LessonStatus, publicLog: string, privateNotes: string) => {
        const lesson = classes.find(l => l.id === id);
        if (!lesson) return;

        const payload: LessonRequest = {
            studentId: lesson.studentId,
            dateTime: lesson.dateTime,
            endTime: lesson.endTime,
            status: newStatus,
            publicLog,
            privateNotes
        };

        await api.put(`/lessons/${id}`, payload);
        setSelectedClass(null);
        fetchData();
    };

    const addCredits = async (amount: number, price: number) => {
        if (!student) return;

        try {
            await api.put(`/students/${student.id}`, {
                ...student,
                creditBalance: student.creditBalance + amount
            });

            const today = new Date().toISOString().split('T')[0];
            await api.post('/finances', {
                studentId: student.id,
                amount: price,
                dueDate: today,
                status: "PENDING",
                description: `Pacote de ${amount} créditos`
            });

            setShowAddCredits(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Carregando dados do aluno...</div>;
    }

    if (!student) {
        return <div className="p-8 text-center text-muted-foreground">Aluno não encontrado</div>;
    }

    const isPackage = student.billingType === BillingType.CREDIT_PACKAGE;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/students">
                <Button variant="ghost" className="gap-2 -ml-2">
                    <ArrowLeft className="size-4" /> Voltar para Alunos
                </Button>
            </Link>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-3xl font-bold text-primary">{student.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-bold">{student.name}</h1>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {student.subject}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Status: {student.active ? "Ativo" : "Inativo"} | Cobrança: {isPackage ? "Pacote de Créditos" : "Mensalidade"}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={handleGeneratePDF} className="w-full bg-primary hover:bg-primary/90 h-14 gap-3" size="lg">
                <FileText className="size-5" /> Gerar Relatório PDF
            </Button>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="size-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                            <TrendingUp className="size-5 text-green-600" />
                        </div>
                        <p className="text-xs text-muted-foreground">Receita Recebida</p>
                        <p className="font-bold text-green-600">{formatCurrency(paidRevenue)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                            <BookOpen className="size-5 text-blue-600" />
                        </div>
                        <p className="text-xs text-muted-foreground">Aulas Realizadas</p>
                        <p className="font-bold text-primary">{completedClasses.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                            <DollarSign className="size-5 text-orange-600" />
                        </div>
                        <p className="text-xs text-muted-foreground">Pendente</p>
                        <p className="font-bold text-orange-600">{formatCurrency(pendingRevenue)}</p>
                    </CardContent>
                </Card>
            </div>

            {isPackage && (
                <Card>
                    <CardHeader>
                        <CardTitle>Saldo de Créditos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Créditos Disponíveis</p>
                                <p className="text-5xl font-bold text-primary">{student.creditBalance}</p>
                            </div>
                        </div>

                        {showAddCredits ? (
                            <div className="p-4 border border-border rounded-xl space-y-3">
                                <p className="font-medium text-sm">Adicionar Pacote de Créditos</p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {[
                                        { credits: 4, price: 200 },
                                        { credits: 8, price: 400 },
                                        { credits: 12, price: 600 },
                                    ].map((pkg) => (
                                        <button
                                            key={pkg.credits}
                                            onClick={() => addCredits(pkg.credits, pkg.price)}
                                            className="p-3 border-2 border-primary/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                                        >
                                            <p className="font-bold text-primary">{pkg.credits}</p>
                                            <p className="text-xs font-medium mt-1">{formatCurrency(pkg.price)}</p>
                                        </button>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => setShowAddCredits(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => setShowAddCredits(true)} variant="outline" className="w-full gap-2">
                                <Plus className="size-4" /> Adicionar Pacote de Créditos
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Aulas</CardTitle>
                </CardHeader>
                <CardContent>
                    {classes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Nenhuma aula registrada</p>
                    ) : (
                        <div className="space-y-4">
                            {classes.map((classItem, index) => (
                                <div key={classItem.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                                    <div className="flex flex-col items-center pt-1">
                                        {classItem.status === LessonStatus.COMPLETED && (
                                            <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle2 className="size-4 text-green-600" />
                                            </div>
                                        )}
                                        {classItem.status === LessonStatus.CANCELED && (
                                            <div className="size-8 rounded-full bg-red-100 flex items-center justify-center">
                                                <XCircle className="size-4 text-red-600" />
                                            </div>
                                        )}
                                        {classItem.status === LessonStatus.SCHEDULED && (
                                            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Clock className="size-4 text-blue-600" />
                                            </div>
                                        )}
                                        {index < classes.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {formatDate(classItem.dateTime)} às {formatTime(classItem.dateTime)}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={
                                                classItem.status === LessonStatus.COMPLETED ? "bg-green-50 text-green-700 border-green-200" :
                                                    classItem.status === LessonStatus.CANCELED ? "bg-red-50 text-red-700 border-red-200" :
                                                        "bg-blue-50 text-blue-700 border-blue-200"
                                            }>
                                                {classItem.status === LessonStatus.COMPLETED && "Realizada"}
                                                {classItem.status === LessonStatus.CANCELED && "Faltou"}
                                                {classItem.status === LessonStatus.SCHEDULED && "Agendada"}
                                            </Badge>
                                        </div>
                                        {classItem.publicLog && (
                                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-2">
                                                {classItem.publicLog}
                                            </p>
                                        )}
                                        {classItem.status === LessonStatus.SCHEDULED && (
                                            <Button size="sm" className="mt-2" onClick={() => setSelectedClass(classItem)}>
                                                Finalizar Aula
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {transactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="size-5" /> Pagamentos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {transactions.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">{t.description || "Pagamento"}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(t.dueDate)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(t.amount)}</p>
                                        <Badge variant="outline" className={
                                            t.status === "PAID" ? "bg-green-50 text-green-700 border-green-200 text-xs" :
                                                t.status === "OVERDUE" ? "bg-red-50 text-red-700 border-red-200 text-xs" :
                                                    "bg-orange-50 text-orange-700 border-orange-200 text-xs"
                                        }>
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
            )}

            {selectedClass && (
                <QuickClassFinishModal
                    classData={selectedClass}
                    open={!!selectedClass}
                    onClose={() => setSelectedClass(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
}