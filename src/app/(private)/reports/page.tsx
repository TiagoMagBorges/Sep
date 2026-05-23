"use client";

import { useState } from "react";
import { Download, FileText, CalendarIcon, AlertCircle, TrendingDown, BookOpen, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

import { useStudents } from "@/hooks/useStudents";
import { useReports } from "@/hooks/useReports";
import { ReportType, ProfessorAnalytics } from "@/types/Report";

export default function ReportsPage() {
    const [reportType, setReportType] = useState<ReportType>("student");
    const [selectedEntity, setSelectedEntity] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const [internalAnalytics, setInternalAnalytics] = useState<ProfessorAnalytics | null>(null);

    const { students, isLoading: isLoadingStudents } = useStudents();

    const { isGenerating, error, setError, downloadPdfReport, fetchInternalAnalytics } = useReports();

    const handleFilterChange = () => {
        if (internalAnalytics !== null) setInternalAnalytics(null);
        if (error !== null) setError(null);
    };

    const handleGenerateExternalPDF = async () => {
        if (!selectedEntity || !startDate || !endDate) return;

        const studentName = students.find(s => s.id === selectedEntity)?.name.replace(/\s+/g, '_') || "aluno";

        await downloadPdfReport(
            reportType,
            startDate,
            endDate,
            selectedEntity,
            `relatorio_${studentName}`
        );
    };

    const handleGenerateInternalReport = async () => {
        if (!selectedEntity || !startDate || !endDate) return;

        try {
            const data = await fetchInternalAnalytics<ProfessorAnalytics>(
                reportType,
                startDate,
                endDate,
                selectedEntity
            );
            setInternalAnalytics(data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-semibold text-foreground mb-2">Relatórios</h1>
                <p className="text-muted-foreground">
                    Gere relatórios detalhados para alunos, turmas e finanças
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
                    <AlertCircle className="size-5 text-red-500 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurar Relatório</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Tipo de Relatório</Label>
                                <div className="flex flex-col space-y-2">
                                    <label
                                        className="flex items-center space-x-2 cursor-pointer"
                                        onClick={() => {
                                            if (reportType !== 'student') {
                                                setReportType('student');
                                                handleFilterChange();
                                            }
                                        }}
                                    >
                                        <div className={`size-4 rounded-full border flex items-center justify-center ${reportType === 'student' ? 'border-primary' : 'border-input'}`}>
                                            {reportType === 'student' && <div className="size-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <span className="text-sm font-medium">Aluno Individual</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-not-allowed opacity-50">
                                        <div className="size-4 rounded-full border border-input" />
                                        <span className="text-sm font-medium">Turma (Em breve)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Selecionar Aluno</Label>
                                <Select
                                    value={selectedEntity}
                                    onValueChange={(val) => {
                                        setSelectedEntity(val);
                                        handleFilterChange();
                                    }}
                                    disabled={isLoadingStudents}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingStudents ? "Carregando..." : "Escolha uma opção..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id}>
                                                {student.name} - {student.subject}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label>Data Inicial</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 size-4" />
                                                {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : <span className="text-muted-foreground">Selecionar data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={(date) => {
                                                    setStartDate(date);
                                                    handleFilterChange();
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-3">
                                    <Label>Data Final</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 size-4" />
                                                {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : <span className="text-muted-foreground">Selecionar data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={(date) => {
                                                    setEndDate(date);
                                                    handleFilterChange();
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Button
                                    className="w-full justify-start bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white"
                                    onClick={handleGenerateExternalPDF}
                                    disabled={!selectedEntity || !startDate || !endDate || isGenerating}
                                >
                                    <Download className="mr-2 size-4" />
                                    {isGenerating && !internalAnalytics ? "Processando..." : "Gerar PDF (Visão Externa)"}
                                </Button>
                                <p className="text-sm text-muted-foreground px-1">
                                    Relatório formatado para compartilhar com alunos e responsáveis.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={handleGenerateInternalReport}
                                    disabled={!selectedEntity || !startDate || !endDate || isGenerating}
                                >
                                    <FileText className="mr-2 size-4" />
                                    Gerar Relatório Interno (Professor)
                                </Button>
                                <p className="text-sm text-muted-foreground px-1">
                                    Visão gerencial em tela incluindo notas privadas e análise de evasão.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedEntity && startDate && endDate && !internalAnalytics && (
                        <Card className="bg-muted/30 border-dashed">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Preview da Seleção</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                                        <div>
                                            <p className="text-muted-foreground">Período</p>
                                            <p className="font-medium">
                                                {format(startDate, "dd/MM/yyyy")} a {format(endDate, "dd/MM/yyyy")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Entidade Selecionada</p>
                                            <p className="font-medium">
                                                {students.find((s) => s.id === selectedEntity)?.name || "Desconhecido"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {internalAnalytics && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold border-b pb-2 flex items-center gap-2">
                        <ShieldAlert className="size-6 text-primary" />
                        Visão Gerencial: {internalAnalytics.studentName}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total de Aulas</p>
                                <p className="text-3xl font-bold">{internalAnalytics.totalLessons}</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Presenças</p>
                                <p className="text-3xl font-bold text-green-600">{internalAnalytics.attendedLessons}</p>
                            </CardContent>
                        </Card>
                        <Card className={`shadow-sm ${internalAnalytics.missedLessons > 2 ? 'border-red-300 bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                            <CardContent className="p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Faltas</p>
                                <p className={`text-3xl font-bold ${internalAnalytics.missedLessons > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {internalAnalytics.missedLessons}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Taxa de Presença</p>
                                <p className={`text-3xl font-bold ${internalAnalytics.attendanceRate < 75 ? 'text-orange-500' : 'text-primary'}`}>
                                    {internalAnalytics.attendanceRate.toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {internalAnalytics.attendanceRate < 75 && internalAnalytics.totalLessons > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 p-4 rounded-xl flex items-start gap-3">
                            <TrendingDown className="size-5 text-orange-600 dark:text-orange-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-orange-900 dark:text-orange-400">Risco Alto de Churn (Evasão)</h4>
                                <p className="text-sm text-orange-800 dark:text-orange-300">A taxa de presença está abaixo de 75%. É recomendável entrar em contato com os pais ou responsáveis para alinhar o engajamento.</p>
                            </div>
                        </div>
                    )}

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="size-5 text-primary" /> Histórico de Notas Privadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {internalAnalytics.privateNotes.length === 0 ? (
                                <p className="text-center text-muted-foreground py-6">Nenhuma nota privada registrada neste período.</p>
                            ) : (
                                <div className="space-y-4">
                                    {internalAnalytics.privateNotes.map((note, idx) => (
                                        <div key={idx} className="p-4 bg-muted/40 rounded-lg border">
                                            <div className="flex justify-between items-center mb-2">
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                    {format(new Date(note.date), "dd/MM/yyyy 'às' HH:mm")}
                                                </Badge>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap text-foreground/90">{note.note}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}