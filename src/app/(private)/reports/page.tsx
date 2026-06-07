"use client";

import { useState } from "react";
import { AlertCircle, Download, FileText } from "lucide-react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportsPage() {
    const [classGroupId, setClassGroupId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleDownloadPDF() {
        setErrorMessage("");

        if (!classGroupId || !startDate || !endDate) {
            setErrorMessage("Preencha a turma e o período antes de gerar o relatório.");
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.get(`/reports/class-group/${classGroupId}`, {
                params: {
                    start: `${startDate}T00:00:00`,
                    end: `${endDate}T23:59:59`,
                },
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `relatorio-turma-${classGroupId.substring(0, 8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            setErrorMessage("Não foi possível gerar o relatório da turma.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
                <p className="mt-1 text-muted-foreground">Gere o histórico de aulas por turma em PDF.</p>
            </div>

            <Card className="shadow-sm">
                <CardContent className="space-y-6 p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Relatório de turma</h2>
                            <p className="text-sm text-muted-foreground">
                                Informe o identificador da turma e o período das aulas.
                            </p>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="size-4" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="classGroupId">ID da turma</Label>
                        <Input
                            id="classGroupId"
                            placeholder="UUID da turma"
                            value={classGroupId}
                            onChange={(event) => setClassGroupId(event.target.value)}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Data inicial</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Data final</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                            />
                        </div>
                    </div>

                    <Button className="w-full gap-2" onClick={handleDownloadPDF} disabled={isLoading}>
                        <Download className="size-4" />
                        {isLoading ? "Gerando PDF..." : "Gerar PDF"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
