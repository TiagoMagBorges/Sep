import { useState } from "react";
import { format } from "date-fns";
import { api } from "@/services/api";
import { AnalyticsResponse, ReportType } from "@/types/Report";

export function useReports() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatParams = (start: Date, end: Date) => ({
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
    });

    const resolveEndpoint = (basePath: string, type: ReportType, entityId?: string) => {
        switch (type) {
            case "student":
                return `${basePath}/student/${entityId}`;
            case "class":
                return `${basePath}/class-group/${entityId}`;
            case "finance":
                return `${basePath}/finance`;
            default:
                throw new Error("Invalid report type");
        }
    };

    const downloadPdfReport = async (
        type: ReportType,
        start: Date,
        end: Date,
        entityId?: string,
        customFileName: string = "relatorio"
    ) => {
        setIsGenerating(true);
        setError(null);

        try {
            const endpoint = resolveEndpoint("/reports", type, entityId);
            const response = await api.get(endpoint, {
                params: formatParams(start, end),
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", `${customFileName}_${format(start, "yyyyMMdd")}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError("Falha ao gerar o relatório PDF. Verifique os parâmetros informados.");
            throw err;
        } finally {
            setIsGenerating(false);
        }
    };

    const fetchInternalAnalytics = async <T extends AnalyticsResponse>(
        type: ReportType,
        start: Date,
        end: Date,
        entityId?: string
    ): Promise<T> => {
        setIsGenerating(true);
        setError(null);

        try {
            const endpoint = resolveEndpoint("/analytics", type, entityId);
            const response = await api.get<T>(endpoint, {
                params: formatParams(start, end),
            });
            return response.data;
        } catch (err) {
            setError("Falha ao buscar dados gerenciais.");
            throw err;
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        error,
        setError,
        downloadPdfReport,
        fetchInternalAnalytics,
    };
}