import { useState, useEffect, useCallback } from "react";
import { isAxiosError } from "axios";
import { api } from "@/services/api";
import { Lesson, LessonRequest } from "@/types/Lesson";

export function useSchedule(currentDate: Date) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const formatLocalISO = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    };

    const fetchLessons = useCallback(async () => {
        try {
            setIsLoading(true);
            const start = new Date(currentYear, currentMonth, 1, 0, 0, 0);
            const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

            const response = await api.get<Lesson[]>(`/lessons?start=${formatLocalISO(start)}&end=${formatLocalISO(end)}`);
            setLessons(response.data);
        } catch (err) {
            console.error("Erro ao buscar aulas", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentYear, currentMonth]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    const saveLesson = async (id: string | null, payload: LessonRequest) => {
        setError(null);
        try {
            if (id) {
                await api.put(`/lessons/${id}`, payload);
            } else {
                await api.post("/lessons", payload);
            }
            await fetchLessons();
            return true;
        } catch (err) {
            if (isAxiosError(err) && err.response?.status === 409) {
                setError("Conflito de horário: Já existe uma aula agendada neste período.");
            } else {
                setError("Erro ao agendar a aula. Verifique os dados.");
            }
            return false;
        }
    };

    const deleteLesson = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover esta aula?")) return;
        try {
            await api.delete(`/lessons/${id}`);
            await fetchLessons();
        } catch (err) {
            console.error("Erro ao deletar aula", err);
        }
    };

    return {
        lessons,
        isLoading,
        error,
        setError,
        saveLesson,
        deleteLesson
    };
}