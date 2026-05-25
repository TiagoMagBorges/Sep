"use client";

import { useState } from "react";
import {
    Download,
    FileText,
    CalendarIcon,
    AlertCircle,
} from "lucide-react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { useStudents } from "@/hooks/useStudents";
import { useClassGroups } from "@/hooks/useClassGroups";
import { useReports } from "@/hooks/useReports";

import {
    ReportType,
    AnalyticsResponse,
} from "@/types/Report";

export default function ReportsPage() {
    const [reportType, setReportType] = useState<ReportType>("student");
    const [selectedEntity, setSelectedEntity] = useState("");

    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const [analytics, setAnalytics] =
        useState<AnalyticsResponse | null>(null);

    const { students, isLoading: isLoadingStudents } = useStudents();
    const { classGroups, isLoading: isLoadingClassGroups } =
        useClassGroups();

    const {
        isGenerating,
        error,
        setError,
        downloadPdfReport,
        fetchInternalAnalytics,
    } = useReports();

    const handleFilterChange = () => {
        setAnalytics(null);

        if (error) {
            setError(null);
        }
    };

    const handleChangeReportType = (type: ReportType) => {
        setReportType(type);
        setSelectedEntity("");
        handleFilterChange();
    };

    const handleGenerateExternalPDF = async () => {
        if (!startDate || !endDate) return;

        await downloadPdfReport(
            reportType,
            startDate,
            endDate,
            reportType === "finance" ? undefined : selectedEntity
        );
    };

    const handleGenerateInternalReport = async () => {
        if (!startDate || !endDate) return;

        const data = await fetchInternalAnalytics<AnalyticsResponse>(
            reportType,
            startDate,
            endDate,
            reportType === "finance" ? undefined : selectedEntity
        );

        setAnalytics(data);
    };

    const shouldShowEntitySelect = reportType !== "finance";
    const isStudentReport = reportType === "student";
    const isClassReport = reportType === "class";

    const canGenerate =
        !!startDate &&
        !!endDate &&
        (reportType === "finance" || !!selectedEntity);

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-semibold mb-2">
                    Relatórios
                </h1>
                <p className="text-muted-foreground">
                    Gere relatórios detalhados por aluno, turma ou financeiro
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
                    <AlertCircle className="size-5 text-red-500 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Configurar Relatório</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Tipo de Relatório</Label>

                            <div className="flex flex-col gap-3">
                                <label
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() =>
                                        handleChangeReportType("student")
                                    }
                                >
                                    <input
                                        type="radio"
                                        checked={reportType === "student"}
                                        readOnly
                                    />
                                    <span>Aluno Individual</span>
                                </label>

                                <label
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() =>
                                        handleChangeReportType("class")
                                    }
                                >
                                    <input
                                        type="radio"
                                        checked={reportType === "class"}
                                        readOnly
                                    />
                                    <span>Turma</span>
                                </label>

                                <label
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() =>
                                        handleChangeReportType("finance")
                                    }
                                >
                                    <input
                                        type="radio"
                                        checked={reportType === "finance"}
                                        readOnly
                                    />
                                    <span>Financeiro</span>
                                </label>
                            </div>
                        </div>

                        {shouldShowEntitySelect && (
                            <div className="space-y-3">
                                <Label>
                                    {isStudentReport
                                        ? "Selecionar Aluno"
                                        : "Selecionar Turma"}
                                </Label>

                                <Select
                                    value={selectedEntity}
                                    onValueChange={(value) => {
                                        setSelectedEntity(value);
                                        handleFilterChange();
                                    }}
                                    disabled={
                                        isStudentReport
                                            ? isLoadingStudents
                                            : isLoadingClassGroups
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {isStudentReport &&
                                            students.map((student) => (
                                                <SelectItem
                                                    key={student.id}
                                                    value={student.id}
                                                >
                                                    {student.name}
                                                </SelectItem>
                                            ))}

                                        {isClassReport &&
                                            classGroups.map((group) => (
                                                <SelectItem
                                                    key={group.id}
                                                    value={group.id}
                                                >
                                                    {group.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Data Inicial</Label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <CalendarIcon className="mr-2 size-4" />
                                            {startDate
                                                ? format(
                                                    startDate,
                                                    "dd/MM/yyyy",
                                                    { locale: ptBR }
                                                )
                                                : "Selecionar data"}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-3">
                                <Label>Data Final</Label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <CalendarIcon className="mr-2 size-4" />
                                            {endDate
                                                ? format(
                                                    endDate,
                                                    "dd/MM/yyyy",
                                                    { locale: ptBR }
                                                )
                                                : "Selecionar data"}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ações</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Button
                            className="w-full"
                            onClick={handleGenerateExternalPDF}
                            disabled={!canGenerate || isGenerating}
                        >
                            <Download className="mr-2 size-4" />
                            Gerar PDF
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleGenerateInternalReport}
                            disabled={!canGenerate || isGenerating}
                        >
                            <FileText className="mr-2 size-4" />
                            Gerar Relatório Interno
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {analytics && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resultado</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(analytics, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}