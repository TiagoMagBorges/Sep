import { useState } from "react";
import { format } from "date-fns";
import { api } from "@/services/api";
import { AnalyticsResponse, ReportType } from "@/types/Report";
import Cookies from "js-cookie";

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
    ): Promise<T | null> => {
        setIsGenerating(true);
        setError(null);

        try {
            const endpoint = resolveEndpoint("/analytics", type, entityId);
            const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
            const url = `${baseURL}${endpoint}?start=${format(start, "yyyy-MM-dd")}&end=${format(end, "yyyy-MM-dd")}`;

            // Pega o token do mesmo local que o interceptor usa
            const token =
                Cookies.get('sep.token') ||
                Cookies.get('token') ||
                (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(url, { headers });

            if (!res.ok) {
                let errorMessage = `Erro ${res.status}`;
                try {
                    const body = await res.json();
                    errorMessage = body.message || body.error || errorMessage;
                } catch {}
                throw new Error(errorMessage);
            }

            return await res.json();
        } catch (err: any) {
            const message = err.message || "Falha ao buscar dados gerenciais.";
            setError(message);
            return null; // Não lança o erro, mantém o controle na UI
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