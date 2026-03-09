import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";

export interface FinanceTransaction {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    dueDate: string;
    status: "PAID" | "PENDING" | "OVERDUE";
    description?: string;
}

export function useFinances(start: string, end: string) {
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFinances = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get<FinanceTransaction[]>(`/finances?start=${start}&end=${end}`);
            setTransactions(response.data);
        } catch (error) {
            console.error("Erro ao buscar finanças:", error);
        } finally {
            setIsLoading(false);
        }
    }, [start, end]);

    useEffect(() => {
        if (start && end) {
            fetchFinances();
        }
    }, [fetchFinances, start, end]);

    const saveFinance = async (payload: any) => {
        await api.post("/finances", payload);
        await fetchFinances();
    };

    return { transactions, isLoading, saveFinance, fetchFinances };
}