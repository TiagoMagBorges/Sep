"use client";

import { useState } from "react";
import { Download, FileText, CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { api } from "@/services/api";
import { useStudents } from "@/hooks/useStudents";

export default function ReportsPage() {
    const [reportType, setReportType] = useState<"student" | "class">("student");
    const [selectedEntity, setSelectedEntity] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { students, isLoading: isLoadingStudents } = useStudents();

    const handleGenerateExternalPDF = async () => {
        if (!selectedEntity || !startDate || !endDate) return;

        setIsGenerating(true);
        setError(null);

        try {
            const startStr = format(startDate, "yyyy-MM-dd");
            const endStr = format(endDate, "yyyy-MM-dd");

            const response = await api.get(`/reports/student/${selectedEntity}`, {
                params: { start: startStr, end: endStr },
                responseType: "blob"
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;

            const studentName = students.find(s => s.id === selectedEntity)?.name.replace(/\s+/g, '_') || "aluno";
            link.setAttribute("download", `relatorio_${studentName}_${startStr}.pdf`);

            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError("Falha ao gerar o relatório. Verifique se o aluno possui aulas no período.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateInternalReport = () => {
        alert("A geração de relatório interno (notas privadas) será implementada em uma US futura.");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">Relatórios</h1>
                <p className="text-gray-600">
                    Gere relatórios detalhados para alunos e turmas
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
                                    <label className="flex items-center space-x-2 cursor-pointer">
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
                                    onValueChange={setSelectedEntity}
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
                                                {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : <span className="text-gray-500">Selecionar data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-3">
                                    <Label>Data Final</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 size-4" />
                                                {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : <span className="text-gray-500">Selecionar data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
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
                                    className="w-full justify-start bg-[#0F4C81] hover:bg-[#0F4C81]/90"
                                    onClick={handleGenerateExternalPDF}
                                    disabled={!selectedEntity || !startDate || !endDate || isGenerating}
                                >
                                    <Download className="mr-2 size-4" />
                                    {isGenerating ? "Processando..." : "Gerar PDF (Visão Externa)"}
                                </Button>
                                <p className="text-sm text-gray-600 px-1">
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
                                <p className="text-sm text-gray-600 px-1">
                                    Relatório completo incluindo notas privadas e métricas detalhadas.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedEntity && startDate && endDate && (
                        <Card className="bg-muted/30 border-dashed">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Preview da Seleção</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                                        <div>
                                            <p className="text-gray-600">Período</p>
                                            <p className="font-medium">
                                                {format(startDate, "dd/MM/yyyy")} a {format(endDate, "dd/MM/yyyy")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Aluno</p>
                                            <p className="font-medium">
                                                {students.find((s) => s.id === selectedEntity)?.name || "Desconhecido"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs border border-blue-200">
                                        <AlertCircle className="size-4 inline mr-1 -mt-0.5" />
                                        As métricas detalhadas de presença e logs serão calculadas automaticamente no documento final.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}