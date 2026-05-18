import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { Finance, FinanceRequest } from "@/types/Finance";

export function useFinances(start: string, end: string) {
    const [transactions, setTransactions] = useState<Finance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFinances = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get<Finance[]>(`/finances?start=${start}&end=${end}`);
            setTransactions(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [start, end]);

    useEffect(() => {
        if (start && end) {
            fetchFinances();
        }
    }, [fetchFinances, start, end]);

    const saveFinance = async (payload: FinanceRequest): Promise<boolean> => {
        try {
            await api.post("/finances", payload);
            await fetchFinances();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return { transactions, isLoading, saveFinance, fetchFinances };
}